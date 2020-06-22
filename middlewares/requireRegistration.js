export default checkRegisteredUser = async (req, res) => {
  if (req.session) return true;
};
