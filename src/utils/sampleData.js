// Datos de ejemplo para notificaciones
export const sampleNotifications = [
  {
    id: 1,
    type: "adoption",
    title: "Solicitud de adopción enviada",
    message: "Tu solicitud para adoptar a Bobby ha sido enviada y está siendo revisada.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
    read: false,
  },
  {
    id: 2,
    type: "approval",
    title: "¡Adopción aprobada!",
    message: "Tu solicitud para adoptar a Luna ha sido aprobada. Contacta al dueño para coordinar la entrega.",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 horas atrás
    read: false,
  },
  {
    id: 3,
    type: "message",
    title: "Nuevo mensaje",
    message: "Tienes un nuevo mensaje sobre la adopción de Max.",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
    read: true,
  },
  {
    id: 4,
    type: "system",
    title: "Bienvenido a ANIMALS",
    message: "Gracias por unirte a nuestra comunidad. ¡Explora las mascotas disponibles!",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 días atrás
    read: true,
  },
];

// Datos de ejemplo para conversaciones
export const sampleConversations = [
  {
    id: 1,
    name: "María González",
    lastMessage: "Hola, ¿está disponible Luna?",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutos atrás
    unread: 2,
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    lastMessage: "Perfecto, nos vemos mañana",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
    unread: 0,
  },
  {
    id: 3,
    name: "Refugio San José",
    lastMessage: "Gracias por tu interés en adoptar",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
    unread: 1,
  },
];

// Función para inicializar datos de ejemplo
export const initializeSampleData = () => {
  try {
    // Inicializar notificaciones si no existen
    if (!localStorage.getItem("notifications")) {
      localStorage.setItem("notifications", JSON.stringify(sampleNotifications));
    }

    // Inicializar conversaciones si no existen
    if (!localStorage.getItem("conversations")) {
      localStorage.setItem("conversations", JSON.stringify(sampleConversations));
    }

    // Inicializar mensajes de ejemplo para las conversaciones
    sampleConversations.forEach(conversation => {
      const messageKey = `messages_${conversation.id}`;
      if (!localStorage.getItem(messageKey)) {
        const sampleMessages = [
          {
            id: Date.now(),
            content: conversation.lastMessage,
            sender: "other",
            timestamp: conversation.timestamp,
          },
        ];
        localStorage.setItem(messageKey, JSON.stringify(sampleMessages));
      }
    });
  } catch (e) {
    console.error("Error initializing sample data", e);
  }
};
