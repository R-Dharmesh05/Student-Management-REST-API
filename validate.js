// Validates a student body. Returns { errors, value } where value is the cleaned data.
function validateStudent(body = {}) {
  const errors = {};
  const str = (v) => (typeof v === "string" ? v.trim() : "");
  const name = str(body.name), email = str(body.email).toLowerCase();
  const phone = str(body.phone), course = str(body.course);
  const address = body.address == null ? null : str(body.address);
  const year = Number(body.year);

  if (name.length < 2 || name.length > 100) errors.name = "name must be 2-100 characters";
  else if (!/^[A-Za-z][A-Za-z .'-]*$/.test(name)) errors.name = "name may contain letters, spaces, . ' - only";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) errors.email = "a valid email is required";
  if (!/^\d{10}$/.test(phone)) errors.phone = "phone must be exactly 10 digits";
  if (!course || course.length > 80) errors.course = "course is required (max 80 characters)";
  if (!Number.isInteger(year) || year < 1 || year > 4) errors.year = "year must be an integer from 1 to 4";
  if (address && address.length > 255) errors.address = "address must be 255 characters or fewer";

  return { errors, value: { name, email, phone, course, year, address: address || null } };
}

module.exports = { validateStudent };
