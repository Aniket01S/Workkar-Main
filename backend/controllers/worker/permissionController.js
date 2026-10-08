import Worker from '../../models/Worker.js';

// @desc    Update worker permissions and location
// @route   PUT /api/worker/permissions
// @access  Private (Worker)
export const updatePermissions = async (req, res) => {
  const { locationPermission, notificationPermission, latitude, longitude, formattedAddress } = req.body;

  try {
    const worker = await Worker.findById(req.user._id);

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    worker.locationPermission = locationPermission ?? worker.locationPermission;
    worker.notificationPermission = notificationPermission ?? worker.notificationPermission;
    
    if (latitude !== undefined) worker.latitude = latitude;
    if (longitude !== undefined) worker.longitude = longitude;
    if (latitude !== undefined && longitude !== undefined) {
      worker.location = {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)]
      };
    }

    if (formattedAddress !== undefined) {
      worker.formattedAddress = formattedAddress;
    } else if (latitude !== undefined && longitude !== undefined) {
      // Reverse geocoding on the backend using the environment variable GOOGLE_MAPS_API_KEY
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (apiKey) {
        try {
          const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
          const response = await fetch(url);
          const data = await response.json();
          if (data.status === 'OK' && data.results && data.results.length > 0) {
            worker.formattedAddress = data.results[0].formatted_address;
          } else {
            worker.formattedAddress = `Location at (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          }
        } catch (error) {
          console.error('Google Maps reverse geocoding failed:', error);
          worker.formattedAddress = `Location at (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
        }
      } else {
        worker.formattedAddress = `Location at (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
      }
    }

    const updatedWorker = await worker.save();

    res.json({
      message: 'Permissions updated successfully',
      locationPermission: updatedWorker.locationPermission,
      notificationPermission: updatedWorker.notificationPermission,
      latitude: updatedWorker.latitude,
      longitude: updatedWorker.longitude,
      formattedAddress: updatedWorker.formattedAddress
    });
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json({ message: 'Server error updating permissions', error: error.message });
  }
};
