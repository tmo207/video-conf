export const getFullUserDetails = ({ ids, users }) =>
  users.filter((user) => ids.includes(user.id.toString()));
