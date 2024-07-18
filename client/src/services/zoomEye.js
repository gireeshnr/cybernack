import axios from 'axios';

const zoomEyeApiKey = process.env.ZOOM_EYE_API_KEY;

export const fetchZoomEyeData = async (domain) => {
  try {
    const response = await axios.get(`https://www.zoomeye.hk/domain/${domain}`, {
      headers: {
        'Authorization': `JWT ${zoomEyeApiKey}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching ZoomEye data:', error.message);
    throw error;
  }
};
