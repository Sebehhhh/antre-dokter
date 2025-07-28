import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../constants/api_constants.dart';
import 'storage_service.dart';

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  IO.Socket? _socket;
  final StorageService _storageService = StorageService();

  bool get isConnected => _socket?.connected ?? false;

  Future<void> connect() async {
    if (_socket?.connected == true) return;

    try {
      final token = await _storageService.getToken();
      
      _socket = IO.io(
        ApiConstants.socketUrl,
        IO.OptionBuilder()
            .setTransports(['websocket'])
            .enableAutoConnect()
            .enableReconnection()
            .setReconnectionAttempts(5)
            .setReconnectionDelay(1000)
            .setAuth({'token': token})
            .build(),
      );

      _socket?.onConnect((_) {
        print('Socket connected: ${_socket?.id}');
      });

      _socket?.onDisconnect((_) {
        print('Socket disconnected');
      });

      _socket?.onError((error) {
        print('Socket error: $error');
      });

      _socket?.connect();
    } catch (e) {
      print('Socket connection error: $e');
    }
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
  }

  void joinRoom(String room) {
    if (_socket?.connected == true) {
      _socket?.emit('join-room', room);
      print('Joined room: $room');
    }
  }

  void leaveRoom(String room) {
    if (_socket?.connected == true) {
      _socket?.emit('leave-room', room);
      print('Left room: $room');
    }
  }

  void onQueueUpdate(Function(Map<String, dynamic>) callback) {
    _socket?.on('queue-update', (data) {
      if (data is Map<String, dynamic>) {
        callback(data);
      }
    });
  }

  void onQueueCall(Function(Map<String, dynamic>) callback) {
    _socket?.on('queue-call', (data) {
      if (data is Map<String, dynamic>) {
        callback(data);
      }
    });
  }

  void onEmergencyClosure(Function(Map<String, dynamic>) callback) {
    _socket?.on('emergency-closure', (data) {
      if (data is Map<String, dynamic>) {
        callback(data);
      }
    });
  }

  void onNotification(Function(Map<String, dynamic>) callback) {
    _socket?.on('notification', (data) {
      if (data is Map<String, dynamic>) {
        callback(data);
      }
    });
  }

  void removeAllListeners() {
    _socket?.clearListeners();
  }
}