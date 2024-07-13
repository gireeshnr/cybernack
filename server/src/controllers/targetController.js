import Target from '../models/Target.js';

export const addTarget = async (req, res) => {
  const { name, domain } = req.body;
  const newTarget = new Target({ name, domain });
  try {
    const savedTarget = await newTarget.save();
    res.status(201).json(savedTarget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getTargets = async (req, res) => {
  try {
    const targets = await Target.find();
    res.status(200).json(targets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
