import { motion } from 'framer-motion';

export const FormInput = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  icon: Icon,
  maxLength,
}) => {
  return (
    <div className="mb-6">
      {label && (
        <label className="block text-sm font-medium text-luxe-gray-300 mb-2">
          {label}
          {required && <span className="text-gold-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-3.5 text-gold-500/50 text-lg" />}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          maxLength={maxLength}
          className={`w-full bg-navy-900/50 border rounded-lg px-4 py-3 transition-all focus:outline-none ${
            Icon ? 'pl-11' : ''
          } ${
            error
                ? 'border-gold-500/50 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20'
              : 'border-gold-500/20 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20'
          } text-luxe-gray-100 placeholder-luxe-gray-600 disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-gold-400 text-sm mt-2"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export const FormTextarea = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
}) => {
  return (
    <div className="mb-6">
      {label && (
        <label className="block text-sm font-medium text-luxe-gray-300 mb-2">
          {label}
          {required && <span className="text-gold-500 ml-1">*</span>}
          {maxLength && (
            <span className="text-luxe-gray-500 text-xs ml-2">
              ({value?.length || 0}/{maxLength})
            </span>
          )}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`w-full bg-navy-900/50 border rounded-lg px-4 py-3 transition-all focus:outline-none resize-none ${
          error
            ? 'border-gold-500/50 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20'
            : 'border-gold-500/20 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20'
        } text-luxe-gray-100 placeholder-luxe-gray-600 disabled:opacity-50 disabled:cursor-not-allowed`}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-gold-400 text-sm mt-2"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export const FormSelect = ({
  label,
  options,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder = 'Select an option',
}) => {
  return (
    <div className="mb-6">
      {label && (
        <label className="block text-sm font-medium text-luxe-gray-300 mb-2">
          {label}
          {required && <span className="text-gold-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full bg-navy-900/50 border rounded-lg px-4 py-3 transition-all focus:outline-none cursor-pointer ${
          error
            ? 'border-gold-500/50 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20'
            : 'border-gold-500/20 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20'
        } text-luxe-gray-100 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <option value="" className="bg-navy-900">
          {placeholder}
        </option>
        {options?.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-navy-900"
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-gold-400 text-sm mt-2"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export const FormCheckbox = ({
  label,
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="mb-4">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="w-5 h-5 rounded border-gold-500/20 bg-navy-900/50 text-gold-500 cursor-pointer disabled:opacity-50"
        />
        <span className="text-sm text-luxe-gray-300">{label}</span>
      </label>
    </div>
  );
};

export const FormRadio = ({
  label,
  name,
  options,
  value,
  onChange,
  required = false,
}) => {
  return (
    <div className="mb-6">
      {label && (
        <label className="block text-sm font-medium text-luxe-gray-300 mb-3">
          {label}
          {required && <span className="text-gold-500 ml-1">*</span>}
        </label>
      )}
      <div className="space-y-2">
        {options?.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="w-4 h-4 border-gold-500/20 bg-navy-900/50 text-gold-500 cursor-pointer"
            />
            <span className="text-sm text-luxe-gray-300">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
