// Sistema de validación centralizado para formularios
export const VALIDATION_RULES = {
  // Validación de nombres
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    message: 'El nombre debe tener entre 2 y 100 caracteres y solo contener letras'
  },
  
  // Validación de email
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Ingresa un email válido'
  },
  
  // Validación de teléfono
  phone: {
    required: false,
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Ingresa un número de teléfono válido'
  },
  
  // Validación de contraseña
  password: {
    required: true,
    minLength: 6,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número'
  },
  
  // Validación de URL de imagen
  imageUrl: {
    required: true,
    pattern: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
    message: 'Ingresa una URL válida de imagen (jpg, jpeg, png, gif, webp)'
  },
  
  // Validación de descripción
  description: {
    required: false,
    maxLength: 1000,
    message: 'La descripción no puede exceder 1000 caracteres'
  },
  
  // Validación de ubicación
  location: {
    required: true,
    minLength: 3,
    maxLength: 200,
    message: 'La ubicación debe tener entre 3 y 200 caracteres'
  },
  
  // Validación de edad
  age: {
    required: true,
    pattern: /^\d+(\s*(años?|meses?|semanas?))?$/i,
    message: 'Ingresa una edad válida (ej: 2 años, 6 meses)'
  },
  
  // Validación de raza
  breed: {
    required: false,
    maxLength: 100,
    message: 'La raza no puede exceder 100 caracteres'
  }
};

// Clase principal de validación
export class FormValidator {
  constructor() {
    this.errors = {};
  }

  // Validar un campo individual
  validateField(fieldName, value, rules = null) {
    const fieldRules = rules || VALIDATION_RULES[fieldName];
    if (!fieldRules) {
      return { isValid: true, message: '' };
    }

    // Verificar si es requerido
    if (fieldRules.required && (!value || value.trim() === '')) {
      return { isValid: false, message: `${fieldName} es requerido` };
    }

    // Si no es requerido y está vacío, es válido
    if (!fieldRules.required && (!value || value.trim() === '')) {
      return { isValid: true, message: '' };
    }

    // Validar longitud mínima
    if (fieldRules.minLength && value.length < fieldRules.minLength) {
      return { 
        isValid: false, 
        message: `${fieldName} debe tener al menos ${fieldRules.minLength} caracteres` 
      };
    }

    // Validar longitud máxima
    if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
      return { 
        isValid: false, 
        message: `${fieldName} no puede exceder ${fieldRules.maxLength} caracteres` 
      };
    }

    // Validar patrón
    if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
      return { 
        isValid: false, 
        message: fieldRules.message || `${fieldName} tiene un formato inválido` 
      };
    }

    return { isValid: true, message: '' };
  }

  // Validar formulario completo
  validateForm(formData, validationRules = {}) {
    this.errors = {};
    let isValid = true;

    Object.keys(formData).forEach(fieldName => {
      const rules = validationRules[fieldName] || VALIDATION_RULES[fieldName];
      if (rules) {
        const validation = this.validateField(fieldName, formData[fieldName], rules);
        if (!validation.isValid) {
          this.errors[fieldName] = validation.message;
          isValid = false;
        }
      }
    });

    return { isValid, errors: this.errors };
  }

  // Validar datos de mascota
  validatePetData(petData) {
    const rules = {
      name: VALIDATION_RULES.name,
      type: {
        required: true,
        pattern: /^(perro|gato|otro)$/,
        message: 'El tipo debe ser perro, gato u otro'
      },
      age: VALIDATION_RULES.age,
      gender: {
        required: true,
        pattern: /^(macho|hembra)$/i,
        message: 'El género debe ser macho o hembra'
      },
      location: VALIDATION_RULES.location,
      img: VALIDATION_RULES.imageUrl,
      description: VALIDATION_RULES.description,
      breed: VALIDATION_RULES.breed
    };

    return this.validateForm(petData, rules);
  }

  // Validar datos de usuario
  validateUserData(userData) {
    const rules = {
      name: VALIDATION_RULES.name,
      email: VALIDATION_RULES.email,
      phone: VALIDATION_RULES.phone,
      address: {
        required: false,
        maxLength: 200,
        message: 'La dirección no puede exceder 200 caracteres'
      }
    };

    return this.validateForm(userData, rules);
  }

  // Validar datos de refugio
  validateShelterData(shelterData) {
    const rules = {
      name: VALIDATION_RULES.name,
      location: VALIDATION_RULES.location,
      description: VALIDATION_RULES.description,
      phone: VALIDATION_RULES.phone,
      email: VALIDATION_RULES.email
    };

    return this.validateForm(shelterData, rules);
  }

  // Validar datos de solicitud de adopción
  validateAdoptionRequestData(requestData) {
    const rules = {
      adopterName: VALIDATION_RULES.name,
      adopterEmail: VALIDATION_RULES.email,
      adopterPhone: VALIDATION_RULES.phone,
      message: {
        required: false,
        maxLength: 500,
        message: 'El mensaje no puede exceder 500 caracteres'
      }
    };

    return this.validateForm(requestData, rules);
  }

  // Obtener mensaje de error para un campo
  getFieldError(fieldName) {
    return this.errors[fieldName] || '';
  }

  // Limpiar errores
  clearErrors() {
    this.errors = {};
  }

  // Verificar si hay errores
  hasErrors() {
    return Object.keys(this.errors).length > 0;
  }
}

// Instancia global del validador
export const formValidator = new FormValidator();

// Funciones de conveniencia
export const validatePetForm = (petData) => {
  return formValidator.validatePetData(petData);
};

export const validateUserForm = (userData) => {
  return formValidator.validateUserData(userData);
};

export const validateShelterForm = (shelterData) => {
  return formValidator.validateShelterData(shelterData);
};

export const validateAdoptionRequestForm = (requestData) => {
  return formValidator.validateAdoptionRequestData(requestData);
};

// Hook para React
export const useFormValidation = () => {
  return {
    validateField: (fieldName, value, rules) => formValidator.validateField(fieldName, value, rules),
    validateForm: (formData, rules) => formValidator.validateForm(formData, rules),
    getFieldError: (fieldName) => formValidator.getFieldError(fieldName),
    clearErrors: () => formValidator.clearErrors(),
    hasErrors: () => formValidator.hasErrors(),
    errors: formValidator.errors
  };
};

export default formValidator;
