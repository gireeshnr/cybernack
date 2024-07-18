import axios from 'axios';

const zoomEyeApiKey = process.env.ZOOM_EYE_API_KEY;

export const fetchZoomEyeData = async (domain) => {
  try {
    const response = await axios.get(`https://api.zoomeye.hk/domain/search?q=${domain}`, {
      headers: {
        'API-KEY': zoomEyeApiKey
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { message: 'No data found for the provided domain.' };
    }
    console.error('Error fetching ZoomEye data:', error.message);
    return { message: 'Error fetching ZoomEye data' };
  }
};
