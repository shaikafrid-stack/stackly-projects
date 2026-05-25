/**
 * Validate the product form fields.
 * Returns an object: { fieldName: errorMessage }
 */
export function validateProduct(form) {
  const errors = {};

  if (!form.title.trim()) {
    errors.title = 'Product name is required.';
  } else if (form.title.trim().length < 3) {
    errors.title = 'Product name must be at least 3 characters.';
  }

  if (!form.category) {
    errors.category = 'Please select a category.';
  }

  if (!form.price) {
    errors.price = 'Price is required.';
  } else if (isNaN(form.price) || Number(form.price) <= 0) {
    errors.price = 'Price must be a positive number.';
  } else if (Number(form.price) > 1_000_000) {
    errors.price = 'Price cannot exceed $1,000,000.';
  }

  if (form.quantity === '' || form.quantity === undefined) {
    errors.quantity = 'Quantity is required.';
  } else if (isNaN(form.quantity) || Number(form.quantity) < 0) {
    errors.quantity = 'Quantity must be 0 or more.';
  } else if (!Number.isInteger(Number(form.quantity))) {
    errors.quantity = 'Quantity must be a whole number.';
  }

  if (form.image && !/^https?:\/\/.+\..+/.test(form.image)) {
    errors.image = 'Image must be a valid URL (http/https).';
  }

  return errors;
}
