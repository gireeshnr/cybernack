import Industry from '../models/Industry.js';

// Create
export const createIndustry = async (req, res) => {
  try {
    const industry = new Industry(req.body);
    const savedIndustry = await industry.save();
    res.status(201).json(savedIndustry);
  } catch (error) {
    res.status(500).json({ message: 'Error creating industry', error: error.message });
  }
};

// Read (Get All)
export const getIndustries = async (req, res) => {
  try {
    const industries = await Industry.find();
    res.status(200).json(industries.length ? industries : []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching industries', error: error.message });
  }
};

// Update
export const updateIndustry = async (req, res) => {
  try {
    const updatedIndustry = await Industry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedIndustry) {
      return res.status(404).json({ message: 'Industry not found' });
    }
    res.status(200).json(updatedIndustry);
  } catch (error) {
    res.status(500).json({ message: 'Error updating industry', error: error.message });
  }
};

// Delete
export const deleteIndustry = async (req, res) => {
  try {
    const deletedIndustry = await Industry.findByIdAndDelete(req.params.id);
    if (!deletedIndustry) {
      return res.status(404).json({ message: 'Industry not found' });
    }
    res.status(200).json({ message: 'Industry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting industry', error: error.message });
  }
};