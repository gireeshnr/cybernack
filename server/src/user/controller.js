import UserModel from '../models/user.js'; // Update the path

export default {
  getProfile: (req, res) => {
    UserModel.findById(req.user.id)
      .then(user => {
        if (!user) return res.status(404).send('User not found');
        res.send(user);
      })
      .catch(err => res.status(500).send(err));
  },

  updateProfile: async (req, res, next) => {
    try {
      const user = await UserModel.findById(req.user.id).exec();

      if (!user) {
        console.error('User not found');
        return res.status(404).send('User not found');
      }

      console.log('User found:', user);

      // Ensure comparePassword is available on the user object
      if (typeof user.comparePassword !== 'function') {
        console.error('comparePassword is not a function on the user object');
        return res.status(500).send('Internal Server Error');
      }

      const isMatch = await user.comparePassword(req.body.password);
      if (!isMatch) {
        console.error('Password comparison failed: Incorrect password');
        return res.status(401).send('Incorrect Password');
      }

      console.log('Password comparison success: Passwords match');

      user.name.first = req.body.firstName;
      user.name.last = req.body.lastName;

      const updatedUser = await user.save();
      res.send(updatedUser);
    } catch (err) {
      console.error('Error occurred while updating profile:', err);
      res.status(500).send('Internal Server Error');
    }
  }
};
