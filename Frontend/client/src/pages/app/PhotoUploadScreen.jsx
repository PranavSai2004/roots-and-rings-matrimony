import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCamera as Camera, FaCheck as Check, FaArrowRight as ArrowRight } from 'react-icons/fa6';
import { useOnboardingProgress } from '../../hooks/useOnboardingProgress';
import { useProfile } from '../../hooks/useProfile';
import api from '../../services/api';

export const PhotoUploadScreen = () => {
  const navigate = useNavigate();
  const { progress, updateProgress } = useOnboardingProgress();
  const { photos, updatePhotoMeta } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  // ephemeral previews only (do NOT persist base64 in localStorage)
  const [previewUrls, setPreviewUrls] = useState(() => ({
    headshot: photos.headshot?.uploadedUrl || null,
    halfBody: photos.halfBody?.uploadedUrl || null,
    threeQuarter: photos.threeQuarter?.uploadedUrl || null,
    fullBody: photos.fullBody?.uploadedUrl || null,
  }));
  const [selectedFiles, setSelectedFiles] = useState({
    headshot: null,
    halfBody: null,
    threeQuarter: null,
    fullBody: null,
  });

  useEffect(() => {
    const fetchExistingPhotos = async () => {
      try {
        const response = await api.get('/profile/me');
        const existingPhotos = response.data.photos || [];
        
        const updatedPreviews = {};
        existingPhotos.forEach(photo => {
          const type = photo.photoType;
          if (type && ['headshot', 'halfBody', 'threeQuarter', 'fullBody'].includes(type)) {
            updatedPreviews[type] = photo.photoUrl;
            updatePhotoMeta(type, {
              fileName: 'Uploaded Image',
              uploadedUrl: photo.photoUrl,
              status: 'uploaded'
            });
          }
        });

        setPreviewUrls(prev => ({
          ...prev,
          ...updatedPreviews
        }));
      } catch (error) {
        console.error('Error fetching existing photos:', error);
      }
    };

    fetchExistingPhotos();
  }, [updatePhotoMeta]);

  const photoTypes = [
    { id: 'headshot', label: 'Primary Headshot *', description: 'Clear face photo, well-lit (Required)', icon: '📸' },
    { id: 'halfBody', label: 'Half Body Photo', description: 'From waist up', icon: '👤' },
    { id: 'threeQuarter', label: 'Three Quarter Photo', description: 'From knees up', icon: '🧍' },
    { id: 'fullBody', label: 'Full Body Photo', description: 'Full standing height', icon: '👔' },
  ];

  const handleFileChange = (photoType, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // create ephemeral preview URL - do NOT persist this
    const url = URL.createObjectURL(file);
    setPreviewUrls((current) => ({ ...current, [photoType]: url }));
    setSelectedFiles((current) => ({ ...current, [photoType]: file }));

    // persist lightweight metadata only
    updatePhotoMeta(photoType, { fileName: file.name, uploadedUrl: null, status: 'pending' });
  };

  const handleRemovePhoto = (photoType) => {
    updatePhotoMeta(photoType, null);
    // revoke object URL if present
    if (previewUrls[photoType]) {
      try { URL.revokeObjectURL(previewUrls[photoType]); } catch {}
    }
    setPreviewUrls((current) => ({ ...current, [photoType]: null }));
    setSelectedFiles((current) => ({ ...current, [photoType]: null }));
  };

  // consider a photo selected when previewUrl exists for the primary headshot
  const allPhotosSelected = !!previewUrls.headshot;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!allPhotosSelected) {
      alert('Please upload your primary profile photo (Headshot) before continuing');
      return;
    }

    setIsLoading(true);

    try {
      // Upload each photo
      for (const photoType of ['headshot', 'halfBody', 'threeQuarter', 'fullBody']) {
        const photoMeta = photos[photoType];
        const fileToUpload = selectedFiles[photoType];
        if (photoMeta && fileToUpload) {
          const formData = new FormData();
          formData.append('photo', fileToUpload);
          formData.append('photoType', photoType);
          
          const response = await api.post(
            '/profile/upload-photo',
            formData,
            {
              headers: { 
                'Content-Type': 'multipart/form-data'
              }
            }
          );
          
          updatePhotoMeta(photoType, { 
            ...photoMeta, 
            uploadedUrl: response.data.photoUrl, 
            status: 'uploaded' 
          });
        }
      }

      updateProgress({ photosUploaded: true });

      if (progress.profileApproved) {
        setIsLoading(false);
        navigate('/app/my-profile', { state: { successMsg: 'Profile photos updated successfully!' } });
      } else {
        // Tell backend all photos are submitted — triggers pending_review
        await api.post(
          '/profile/complete-photos',
          {}
        );
        setIsLoading(false);
        navigate('/app/review-pending');
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Photo upload error:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-navy-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500">
                Upload Your Photos
              </span>
            </h1>
            <p className="text-luxe-gray-400">
              Please upload clear and recent photos. This helps us verify your profile.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 p-4 bg-gold-500/10 border border-gold-500/20 rounded-lg"
          >
            <p className="text-sm text-luxe-gray-300">
              ✓ Use recent photos where you're clearly visible <br />
              ✓ Good lighting is important <br />
              ✓ Avoid excessive filters or editing <br />
              ✓ All photos must be yours
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {photoTypes.map((photoType) => (
              <motion.div key={photoType.id} variants={itemVariants} className="relative group">
                {previewUrls[photoType.id] ? (
                  <div className="relative h-80 rounded-xl overflow-hidden border-2 border-gold-500 shadow-luxury">
                    <img
                      src={previewUrls[photoType.id]}
                      alt={photoType.label}
                      className="w-full h-full object-cover"
                    />

                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3 cursor-pointer"
                      onClick={() => document.getElementById(`file-${photoType.id}`).click()}
                    >
                      <button
                        type="button"
                        className="px-3 py-1.5 bg-gold-500 text-navy-950 rounded-lg text-xs font-semibold hover:bg-gold-400 transition-colors"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRemovePhoto(photoType.id);
                        }}
                        className="px-3 py-1.5 bg-navy-900/70 text-luxe-gray rounded-lg text-xs font-semibold hover:bg-gold-500/20 hover:text-gold-400 border border-gold-500/20 transition-colors"
                      >
                        Remove
                      </button>
                    </motion.div>

                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gold-500 text-navy-950 flex items-center justify-center">
                      <Check className="text-xs" />
                    </div>

                    <input
                      id={`file-${photoType.id}`}
                      data-photo-type={photoType.id}
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleFileChange(photoType.id, event)}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <label
                    htmlFor={`file-${photoType.id}`}
                    className="block h-80 border-2 border-dashed border-gold-500/50 rounded-xl p-4 cursor-pointer transition-all hover:border-gold-500 hover:bg-gold-500/5 group-hover:border-gold-500"
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-4xl mb-3"
                      >
                        {photoType.icon}
                      </motion.div>
                      <p className="text-sm font-bold text-gold-400 mb-0.5">{photoType.label}</p>
                      <p className="text-[11px] text-luxe-gray-400 text-center mb-3 line-clamp-2">
                        {photoType.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-luxe-gray-500">
                        <Camera className="text-xs" />
                        Click to upload
                      </div>
                    </div>
                    <input
                      id={`file-${photoType.id}`}
                      data-photo-type={photoType.id}
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleFileChange(photoType.id, event)}
                      className="hidden"
                    />
                  </label>
                )}
              </motion.div>
            ))}
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex justify-between mb-2">
              <p className="text-sm font-medium text-luxe-gray-300">Upload Progress</p>
              <p className="text-sm text-gold-400">
                {['headshot', 'halfBody', 'threeQuarter', 'fullBody'].filter(k => !!previewUrls[k]).length}/4
              </p>
            </div>
            <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(['headshot', 'halfBody', 'threeQuarter', 'fullBody'].filter(k => !!previewUrls[k]).length / 4) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-gold-400 to-gold-500"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <motion.button
              whileHover={{ scale: allPhotosSelected ? 1.02 : 1 }}
              whileTap={{ scale: allPhotosSelected ? 0.98 : 1 }}
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !allPhotosSelected}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="text-sm" />
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => navigate('/app/dashboard')}
              className="w-full btn-ghost"
            >
              Save & Continue Later
            </motion.button>
          </motion.div>
        </div>
      </div>
  );
};
