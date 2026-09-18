export function validatePassword(password) {
  const strongRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()[\]{}\-_=+]).{8,}$/;

  return strongRegex.test(password);
}
