import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight as ArrowRight, FaArrowLeft as ArrowLeft } from 'react-icons/fa6';
import { useProfile } from '../../hooks/useProfile';
import { useOnboardingProgress } from '../../hooks/useOnboardingProgress';
import {
  FormInput,
  FormSelect,
  FormRadio,
} from '../../components/forms/FormComponents';
import api from '../../services/api';

export const Form1 = () => {
  const navigate = useNavigate();
  const { progress, updateProgress } = useOnboardingProgress();
  const { basicDetails, updateBasic } = useProfile();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({ ...basicDetails });

  const [errors, setErrors] = useState({});

  const steps = [
    { number: 1, title: 'Personal Details', fields: ['fullName', 'gender', 'dob', 'height'] },
    { number: 2, title: 'Community Details', fields: ['religion', 'caste', 'motherTongue'] },
    { number: 3, title: 'Professional', fields: ['education', 'occupation', 'city', 'state'] },
  ];

  const currentStepData = steps[currentStep - 1];

  const validateStep = () => {
    const newErrors = {};
    currentStepData.fields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    // Update local form state
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);
    
    // Sync to context (separate from state update to avoid render-cycle violation)
    updateBasic(updatedFormData);
    
    // Clear error if present
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleNext = (event) => {
    event?.preventDefault();
    if (validateStep()) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsLoading(true);

    try {
      const response = await api.post(
        '/profile/form1/submit',
        formData
      );

      setIsLoading(false);
      updateProgress({ basicDetailsCompleted: true });
      
      if (progress.photosUploaded) {
        navigate('/app/my-profile', { state: { successMsg: 'Basic details updated successfully!' } });
      } else {
        navigate('/app/upload-photos');
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Form submission error:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <FormInput
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              error={errors.fullName}
              required
            />

            <FormRadio
              label="Gender"
              name="gender"
              options={[
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' },
                { label: 'Other', value: 'Other' },
              ]}
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              required
            />

            <FormInput
              label="Date of Birth"
              type="date"
              value={formData.dob}
              onChange={(e) => handleChange('dob', e.target.value)}
              error={errors.dob}
              required
            />

            <FormSelect
              label="Height"
              options={[
                { label: "5'0\"", value: '5.0' },
                { label: "5'3\"", value: '5.3' },
                { label: "5'6\"", value: '5.6' },
                { label: "5'9\"", value: '5.9' },
                { label: "6'0\"", value: '6.0' },
                { label: "6'2\"", value: '6.2' },
              ]}
              value={formData.height}
              onChange={(e) => handleChange('height', e.target.value)}
              error={errors.height}
              placeholder="Select your height"
              required
            />
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <FormSelect
              label="Religion"
              options={[
                { label: 'Hindu', value: 'hindu' },
                { label: 'Muslim', value: 'muslim' },
                { label: 'Christian', value: 'christian' },
                { label: 'Sikh', value: 'sikh' },
                { label: 'Buddhist', value: 'buddhist' },
                { label: 'Jain', value: 'jain' },
                { label: 'Other', value: 'other' },
              ]}
              value={formData.religion}
              onChange={(e) => handleChange('religion', e.target.value)}
              error={errors.religion}
              placeholder="Select your religion"
              required
            />

            <FormInput
              label="Caste/Community"
              placeholder="e.g., Brahmin, Kshatriya, Kapu, Reddy, etc."
              value={formData.caste}
              onChange={(e) => handleChange('caste', e.target.value)}
              error={errors.caste}
              required
            />

            <FormSelect
              label="Mother Tongue"
              options={[
                { label: 'Hindi', value: 'hindi' },
                { label: 'English', value: 'english' },
                { label: 'Tamil', value: 'tamil' },
                { label: 'Telugu', value: 'telugu' },
                { label: 'Kannada', value: 'kannada' },
                { label: 'Malayalam', value: 'malayalam' },
                { label: 'Marathi', value: 'marathi' },
                { label: 'Gujarati', value: 'gujarati' },
                { label: 'Bengali', value: 'bengali' },
                { label: 'Punjabi', value: 'punjabi' },
                { label: 'Urdu', value: 'urdu' },
                { label: 'Other', value: 'other' },
              ]}
              value={formData.motherTongue}
              onChange={(e) => handleChange('motherTongue', e.target.value)}
              error={errors.motherTongue}
              placeholder="Select your mother tongue"
              required
            />
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <FormSelect
              label="Education"
              options={[
                { label: "10th Pass", value: "10th" },
                { label: "12th Pass", value: "12th" },
                { label: "Bachelor's Degree", value: "bachelors" },
                { label: "Master's Degree", value: "masters" },
                { label: "PhD", value: "phd" },
                { label: "Other", value: "other" },
              ]}
              value={formData.education}
              onChange={(e) => handleChange('education', e.target.value)}
              error={errors.education}
              placeholder="Select your education"
              required
            />

            <FormInput
              label="Occupation"
              placeholder="e.g., Software Engineer, Doctor, Business Owner"
              value={formData.occupation}
              onChange={(e) => handleChange('occupation', e.target.value)}
              error={errors.occupation}
              required
            />

            <FormInput
              label="City"
              placeholder="Enter your city"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              error={errors.city}
              required
            />

            <FormSelect
              label="State"
              options={[
                { label: 'Andhra Pradesh', value: 'andhra-pradesh' },
                { label: 'Telangana', value: 'telangana' },
                { label: 'Karnataka', value: 'karnataka' },
                { label: 'Tamil Nadu', value: 'tamil-nadu' },
                { label: 'Maharashtra', value: 'maharashtra' },
                { label: 'Delhi', value: 'delhi' },
                { label: 'Gujarat', value: 'gujarat' },
                { label: 'Uttar Pradesh', value: 'uttar-pradesh' },
                { label: 'West Bengal', value: 'west-bengal' },
                { label: 'Punjab', value: 'punjab' },
                { label: 'Other', value: 'other' },
              ]}
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              error={errors.state}
              placeholder="Select your state"
              required
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500">
                Complete Your Profile
              </span>
            </h1>
            <p className="text-luxe-gray-400">
              Tell us more about yourself to get better matches
            </p>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex justify-between mb-4">
              {steps.map((step) => (
                <motion.div
                  key={step.number}
                  className="flex items-center flex-1"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      step.number <= currentStep
                        ? 'bg-gold-500 text-navy-950'
                        : 'bg-navy-800 text-luxe-gray-400 border border-gold-500/20'
                    }`}
                  >
                    {step.number}
                  </div>
                  {step.number < steps.length && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                        step.number < currentStep
                          ? 'bg-gold-500'
                          : 'bg-navy-800'
                      }`}
                    ></div>
                  )}
                </motion.div>
              ))}
            </div>
            <h2 className="text-xl font-bold text-luxe-gray-100">
              Step {currentStep}: {currentStepData.title}
            </h2>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 bg-navy-900/50 border border-gold-500/20 rounded-xl shadow-luxury backdrop-blur-sm mb-8"
          >
            <form
              onSubmit={(event) => {
                if (currentStep === steps.length) {
                  handleSubmit(event);
                  return;
                }

                handleNext(event);
              }}
            >
              {renderStepContent()}

              {/* Buttons */}
              <div className="flex gap-4 mt-8">
                {currentStep > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handlePrev}
                    className="flex-1 btn-ghost flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="text-sm" />
                    Previous
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type={currentStep === steps.length ? 'submit' : 'button'}
                  onClick={currentStep === steps.length ? undefined : handleNext}
                  disabled={isLoading}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : currentStep === steps.length ? (
                    <>
                      Submit Profile
                      <ArrowRight className="text-sm" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="text-sm" />
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-navy-900/50 border border-gold-500/20 rounded-lg"
          >
            <p className="text-xs text-luxe-gray-400">
              💡 Your information is kept secure and private. We never share your details without permission.
            </p>
          </motion.div>
        </div>
      </div>

  );
};
