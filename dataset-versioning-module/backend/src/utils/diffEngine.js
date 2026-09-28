/**
 * diffEngine.js
 * ------------------------------------------------------------------
 * Pure functions that compute the difference between two dataset
 * versions. Kept dependency-free and side-effect-free so it can be
 * unit tested in isolation from the database layer.
 *
 * A "version snapshot" is the shape stored in DatasetVersion.schema_json:
 * {
 *   columns: [{ name, type, nullable }],
 *   recordCount: number,
 *   transformations: [string],
 *   validationRules: [string]
 * }
 */

function safeParse(json, fallback) {
  if (!json) return fallback;
  if (typeof json === 'object') return json;
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function diffColumns(colsA = [], colsB = []) {
  const mapA = new Map(colsA.map((c) => [c.name, c]));
  const mapB = new Map(colsB.map((c) => [c.name, c]));

  const added = [...mapB.keys()].filter((name) => !mapA.has(name)).map((name) => mapB.get(name));
  const removed = [...mapA.keys()].filter((name) => !mapB.has(name)).map((name) => mapA.get(name));

  const typeChanged = [];
  for (const [name, colA] of mapA) {
    const colB = mapB.get(name);
    if (colB && colA.type !== colB.type) {
      typeChanged.push({ name, oldType: colA.type, newType: colB.type });
    }
  }

  return { added, removed, typeChanged };
}

function diffArrayField(listA = [], listB = []) {
  const setA = new Set(listA);
  const setB = new Set(listB);
  return {
    added: [...setB].filter((x) => !setA.has(x)),
    removed: [...setA].filter((x) => !setB.has(x)),
  };
}

/**
 * Computes a full structured comparison between two version snapshots.
 * @param {object} versionA - the DatasetVersion row for the "base" version
 * @param {object} versionB - the DatasetVersion row for the "compare to" version
 */
function compareVersions(versionA, versionB) {
  const snapA = safeParse(versionA.schema_json, { columns: [], transformations: [], validationRules: [] });
  const snapB = safeParse(versionB.schema_json, { columns: [], transformations: [], validationRules: [] });

  const columnDiff = diffColumns(snapA.columns, snapB.columns);
  const transformationDiff = diffArrayField(snapA.transformations, snapB.transformations);
  const validationDiff = diffArrayField(snapA.validationRules, snapB.validationRules);

  const recordCountDiff = (versionB.record_count ?? 0) - (versionA.record_count ?? 0);

  const hasSchemaChange =
    columnDiff.added.length > 0 || columnDiff.removed.length > 0 || columnDiff.typeChanged.length > 0;

  return {
    versionA: {
      id: versionA.id,
      versionNumber: versionA.version_number,
      versionLabel: versionA.version_label,
      recordCount: versionA.record_count,
      status: versionA.status,
    },
    versionB: {
      id: versionB.id,
      versionNumber: versionB.version_number,
      versionLabel: versionB.version_label,
      recordCount: versionB.record_count,
      status: versionB.status,
    },
    schemaDifferences: {
      columnsAdded: columnDiff.added,
      columnsRemoved: columnDiff.removed,
      columnTypeChanges: columnDiff.typeChanged,
      hasChanges: hasSchemaChange,
    },
    recordCountDifference: {
      before: versionA.record_count,
      after: versionB.record_count,
      delta: recordCountDiff,
      percentChange:
        versionA.record_count > 0 ? +((recordCountDiff / versionA.record_count) * 100).toFixed(2) : null,
    },
    transformationDifferences: transformationDiff,
    validationDifferences: validationDiff,
    statusChange: {
      changed: versionA.status !== versionB.status,
      before: versionA.status,
      after: versionB.status,
    },
  };
}

/**
 * Derives a list of DatasetChangeLog-style entries from a computed diff.
 * Used when materializing a new version so the change log table stays
 * consistent with what compareVersions() would report later.
 */
function buildChangeLogEntries(diff, versionId, changedBy) {
  const entries = [];
  const now = new Date();

  diff.schemaDifferences.columnsAdded.forEach((col) => {
    entries.push({
      version_id: versionId,
      change_type: 'COLUMN_ADDED',
      field_name: col.name,
      old_value: null,
      new_value: col.type,
      description: `Column '${col.name}' (${col.type}) was added`,
      changed_by: changedBy,
      changed_at: now,
    });
  });

  diff.schemaDifferences.columnsRemoved.forEach((col) => {
    entries.push({
      version_id: versionId,
      change_type: 'COLUMN_REMOVED',
      field_name: col.name,
      old_value: col.type,
      new_value: null,
      description: `Column '${col.name}' was removed`,
      changed_by: changedBy,
      changed_at: now,
    });
  });

  diff.schemaDifferences.columnTypeChanges.forEach((c) => {
    entries.push({
      version_id: versionId,
      change_type: 'COLUMN_TYPE_CHANGED',
      field_name: c.name,
      old_value: c.oldType,
      new_value: c.newType,
      description: `Column '${c.name}' type changed from ${c.oldType} to ${c.newType}`,
      changed_by: changedBy,
      changed_at: now,
    });
  });

  if (diff.recordCountDifference.delta !== 0) {
    entries.push({
      version_id: versionId,
      change_type: diff.recordCountDifference.delta > 0 ? 'RECORDS_ADDED' : 'RECORDS_REMOVED',
      field_name: null,
      old_value: String(diff.recordCountDifference.before),
      new_value: String(diff.recordCountDifference.after),
      description: `Record count changed by ${diff.recordCountDifference.delta}`,
      changed_by: changedBy,
      changed_at: now,
    });
  }

  diff.transformationDifferences.added.forEach((t) => {
    entries.push({
      version_id: versionId,
      change_type: 'TRANSFORMATION_APPLIED',
      field_name: null,
      old_value: null,
      new_value: t,
      description: `Transformation applied: ${t}`,
      changed_by: changedBy,
      changed_at: now,
    });
  });

  diff.validationDifferences.added.forEach((v) => {
    entries.push({
      version_id: versionId,
      change_type: 'VALIDATION_CHANGED',
      field_name: null,
      old_value: null,
      new_value: v,
      description: `Validation rule added: ${v}`,
      changed_by: changedBy,
      changed_at: now,
    });
  });

  return entries;
}

module.exports = { compareVersions, buildChangeLogEntries, safeParse };
