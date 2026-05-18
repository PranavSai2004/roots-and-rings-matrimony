import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight as ArrowRight, FaArrowLeft as ArrowLeft, FaLock as Lock } from 'react-icons/fa6';
import { useOnboardingProgress } from '../../hooks/useOnboardingProgress';
import { useProfile } from '../../hooks/useProfile';
import { FormInput, FormTextarea, FormSelect } from '../../components/forms/FormComponents';
import api from '../../services/api';

export const Form2 = () => {
  const navigate = useNavigate();
  const { progress, updateProgress } = useOnboardingProgress();
  const { marriageDetails, updateMarriage } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ ...marriageDetails });

  const handleChange = (field, value) => {
    // Safe numeric conversion for siblings
    let finalValue = value;
    if (field === 'siblings') {
      if (value === '' || value === null) {
        finalValue = 0; // fallback to 0 instead of NaN
      } else {
        const parsed = Number(value);
        finalValue = isNaN(parsed) ? 0 : Math.max(0, parsed);
      }
    }

    // Update local form state
    const updatedFormData = { ...formData, [field]: finalValue };
    setFormData(updatedFormData);
    
    // Sync to context (separate from state update to avoid render-cycle violation)
    updateMarriage(updatedFormData);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    // Temporary console validation as requested
    console.log("Siblings payload type:", typeof formData.siblings, formData.siblings);

    try {
      await api.post(
        '/profile/form2/submit',
        formData
      );

      setIsLoading(false);
      
      if (progress.marriageDetailsCompleted) {
        navigate('/app/my-profile', { state: { successMsg: 'Marriage details updated successfully!' } });
      } else {
        updateProgress({ marriageDetailsCompleted: true });
        navigate('/app/final-review');
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Form2 submission error:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold-500/20 bg-gold-500/10 text-gold-400 text-sm mb-4">
              <Lock className="text-xs" />
              Unlocked after verification and payment
            </div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-500 mb-2">
              Form-2: Marriage Details
            </h1>
            <p className="text-luxe-gray-400">Share the values and preferences that matter most to you.</p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-6 p-8 rounded-2xl border border-gold-500/20 bg-navy-900/50 shadow-luxury backdrop-blur-sm"
          >
            {/* Astrology & Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gold-400 border-b border-gold-500/20 pb-2">Astrology & Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormInput label="Raasi" placeholder="e.g. Mesha" value={formData.raasi || ''} onChange={(e) => handleChange('raasi', e.target.value)} />
                <FormInput label="Nakshatra" placeholder="e.g. Ashwini" value={formData.nakshatra || ''} onChange={(e) => handleChange('nakshatra', e.target.value)} />
                <FormInput label="Gothram" placeholder="e.g. Kashyapa" value={formData.gothram || ''} onChange={(e) => handleChange('gothram', e.target.value)} />
              </div>
            </div>

            {/* Physical & Personal Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gold-400 border-b border-gold-500/20 pb-2">Physical & Personal Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Height *" placeholder={'e.g. 5\'6"'} value={formData.height || ''} onChange={(e) => handleChange('height', e.target.value)} required />
                <FormInput type="number" label="Weight (kg)" placeholder="e.g. 70" value={formData.weight || ''} onChange={(e) => handleChange('weight', e.target.value)} />
                <FormInput label="Blood Group" placeholder="e.g. O+" value={formData.bloodGroup || ''} onChange={(e) => handleChange('bloodGroup', e.target.value)} />
                <FormSelect label="Physical Status" placeholder="Select status" value={formData.physicalStatus || ''} onChange={(e) => handleChange('physicalStatus', e.target.value)} options={[{label:'Normal', value:'Normal'}, {label:'Physically Challenged', value:'Physically Challenged'}, {label:'Prefer Not to Say', value:'Prefer Not to Say'}]} />
                <FormSelect label="Marital Status *" placeholder="Select status" value={formData.maritalStatus || ''} onChange={(e) => handleChange('maritalStatus', e.target.value)} options={[{label:'Never Married', value:'Never Married'}, {label:'Divorced', value:'Divorced'}, {label:'Widowed', value:'Widowed'}]} required />
                <FormSelect label="Diet" placeholder="Select diet" value={formData.diet || ''} onChange={(e) => handleChange('diet', e.target.value)} options={[{label:'Vegetarian', value:'Vegetarian'}, {label:'Non-Vegetarian', value:'Non-Vegetarian'}, {label:'Eggetarian', value:'Eggetarian'}, {label:'Vegan', value:'Vegan'}]} />
                <FormSelect label="Smoking" placeholder="Select" value={formData.smoking || ''} onChange={(e) => handleChange('smoking', e.target.value)} options={[{label:'No', value:'No'}, {label:'Occasionally', value:'Occasionally'}, {label:'Yes', value:'Yes'}]} />
                <FormSelect label="Drinking" placeholder="Select" value={formData.drinking || ''} onChange={(e) => handleChange('drinking', e.target.value)} options={[{label:'No', value:'No'}, {label:'Occasionally', value:'Occasionally'}, {label:'Yes', value:'Yes'}]} />
              </div>
            </div>

            {/* Family Background */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gold-400 border-b border-gold-500/20 pb-2">Family Background</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormSelect label="Family Type *" placeholder="Choose family type" value={formData.familyType || ''} onChange={(e) => handleChange('familyType', e.target.value)} options={[{label:'Nuclear Family', value:'Nuclear'}, {label:'Joint Family', value:'Joint'}, {label:'Extended Family', value:'Extended'}]} required />
                <FormSelect label="Family Values" placeholder="Select values" value={formData.familyValues || ''} onChange={(e) => handleChange('familyValues', e.target.value)} options={[{label:'Traditional', value:'Traditional'}, {label:'Moderate', value:'Moderate'}, {label:'Liberal', value:'Liberal'}]} />
                <FormSelect label="Siblings *" placeholder="Select siblings" value={formData.siblings !== undefined ? formData.siblings : ''} onChange={(e) => handleChange('siblings', e.target.value)} options={[{label:'No siblings', value:0}, {label:'One sibling', value:1}, {label:'Two siblings', value:2}, {label:'More than two', value:3}]} required />
                <FormInput label="Native Place" placeholder="e.g. Hyderabad" value={formData.nativePlace || ''} onChange={(e) => handleChange('nativePlace', e.target.value)} />
                <FormInput label="Father Occupation" placeholder="e.g. Business" value={formData.fatherOccupation || ''} onChange={(e) => handleChange('fatherOccupation', e.target.value)} />
                <FormInput label="Mother Occupation" placeholder="e.g. Homemaker" value={formData.motherOccupation || ''} onChange={(e) => handleChange('motherOccupation', e.target.value)} />
              </div>
            </div>

            {/* Professional Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gold-400 border-b border-gold-500/20 pb-2">Professional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormSelect label="Job Type" placeholder="Select job type" value={formData.jobType || ''} onChange={(e) => handleChange('jobType', e.target.value)} options={[{label:'Private', value:'Private'}, {label:'Government', value:'Government'}, {label:'Business', value:'Business'}, {label:'Self-employed', value:'Self-employed'}]} />
                <FormInput label="Company Name" placeholder="e.g. Google" value={formData.companyName || ''} onChange={(e) => handleChange('companyName', e.target.value)} />
                <FormInput type="number" label="Annual Income (₹)" placeholder="e.g. 1200000" value={formData.annualIncome || ''} onChange={(e) => handleChange('annualIncome', e.target.value)} />
                <FormInput label="Work Location" placeholder="e.g. Bangalore" value={formData.workLocation || ''} onChange={(e) => handleChange('workLocation', e.target.value)} />
              </div>
            </div>

            {/* Partner Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gold-400 border-b border-gold-500/20 pb-2">Partner Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <FormInput type="number" label="Min Age" placeholder="e.g. 25" value={formData.preferredAgeRange?.min || ''} onChange={(e) => handleChange('preferredAgeRange', { ...formData.preferredAgeRange, min: e.target.value ? Number(e.target.value) : undefined })} />
                  </div>
                  <div className="flex-1">
                    <FormInput type="number" label="Max Age" placeholder="e.g. 30" value={formData.preferredAgeRange?.max || ''} onChange={(e) => handleChange('preferredAgeRange', { ...formData.preferredAgeRange, max: e.target.value ? Number(e.target.value) : undefined })} />
                  </div>
                </div>
                <FormInput label="Location" placeholder="e.g. Any city in USA" value={formData.preferredLocation || ''} onChange={(e) => handleChange('preferredLocation', e.target.value)} />
                <FormInput label="Education" placeholder="e.g. Masters" value={formData.preferredEducation || ''} onChange={(e) => handleChange('preferredEducation', e.target.value)} />
                <FormInput label="Profession" placeholder="e.g. Software Engineer" value={formData.preferredProfession || ''} onChange={(e) => handleChange('preferredProfession', e.target.value)} />
                <FormInput label="Religion" placeholder="e.g. Hindu" value={formData.preferredReligion || ''} onChange={(e) => handleChange('preferredReligion', e.target.value)} />
                <FormInput label="Caste" placeholder="e.g. Reddy" value={formData.preferredCaste || ''} onChange={(e) => handleChange('preferredCaste', e.target.value)} />
              </div>
            </div>

            {/* About & Expectations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gold-400 border-b border-gold-500/20 pb-2">About & Expectations</h3>
              <FormTextarea label="About Me *" placeholder="Write a warm introduction about yourself" value={formData.aboutMe || ''} onChange={(e) => handleChange('aboutMe', e.target.value)} maxLength={700} rows={5} required />
              <FormTextarea label="Expectations *" placeholder="What are you looking for in a life partner?" value={formData.expectations || ''} onChange={(e) => handleChange('expectations', e.target.value)} maxLength={500} required />
              <FormTextarea label="Lifestyle *" placeholder="Tell us about your routine, habits, and preferences" value={formData.lifestyle || ''} onChange={(e) => handleChange('lifestyle', e.target.value)} maxLength={500} required />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button type="button" onClick={() => navigate('/app/dashboard')} className="btn-ghost flex items-center justify-center gap-2 sm:flex-1">
                <ArrowLeft className="text-xs" />
                Back
              </button>
              <button type="submit" disabled={isLoading} className="btn-primary flex items-center justify-center gap-2 sm:flex-1">
                {isLoading ? 'Saving...' : 'Save and Finish'}
                {!isLoading && <ArrowRight className="text-xs" />}
              </button>
            </div>
          </motion.form>
        </div>
      </div>
  );
};
