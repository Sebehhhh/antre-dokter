class ApiConstants {
  static const String baseUrl = 'http://localhost:5000/api';
  
  // Auth endpoints
  static const String authRegister = '$baseUrl/auth/register';
  static const String authLogin = '$baseUrl/auth/login';
  static const String authMe = '$baseUrl/auth/me';
  
  // Queue endpoints
  static const String queueAvailableSlots = '$baseUrl/queue/available-slots';
  static const String queueCurrent = '$baseUrl/queue/current';
  static const String queueMyQueues = '$baseUrl/queue/my-queues';
  static const String queueBook = '$baseUrl/queue/book';
  static String queueCancel(String queueId) => '$baseUrl/queue/cancel/$queueId';
  
  // Emergency endpoints
  static const String emergencyCheckClosure = '$baseUrl/emergency/check-closure';
  
  // Notification endpoints
  static const String notifications = '$baseUrl/notifications';
  static String notificationMarkRead(String notificationId) => 
      '$baseUrl/notifications/$notificationId/read';
  static const String notificationMarkAllRead = '$baseUrl/notifications/mark-all-read';
  
  // Socket.IO
  static const String socketUrl = 'http://localhost:5000';
}

class ApiHeaders {
  static Map<String, String> get defaultHeaders => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  static Map<String, String> authHeaders(String token) => {
    ...defaultHeaders,
    'Authorization': 'Bearer $token',
  };
}