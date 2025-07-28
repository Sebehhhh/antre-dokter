import 'package:flutter/foundation.dart';
import '../../../core/models/queue_model.dart';
import '../../../core/services/api_service.dart';
import '../../../core/constants/api_constants.dart';

class QueueProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<Queue> _myQueues = [];
  List<String> _availableSlots = [];
  Queue? _currentQueue;
  bool _isLoading = false;
  String? _errorMessage;

  List<Queue> get myQueues => _myQueues;
  List<String> get availableSlots => _availableSlots;
  Queue? get currentQueue => _currentQueue;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchMyQueues() async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.get(
        ApiConstants.queueMyQueues,
        requireAuth: true,
      );

      if (response['success']) {
        final List<dynamic> queueData = response['data'];
        _myQueues = queueData.map((json) => Queue.fromJson(json)).toList();
      } else {
        _setError(response['message'] ?? 'Failed to fetch queues');
      }
    } catch (e) {
      _setError(_getErrorMessage(e));
    } finally {
      _setLoading(false);
    }
  }

  Future<void> fetchAvailableSlots({DateTime? date}) async {
    _setLoading(true);
    _clearError();

    try {
      String url = ApiConstants.queueAvailableSlots;
      if (date != null) {
        url += '?date=${date.toIso8601String().split('T')[0]}';
      }

      final response = await _apiService.get(url);

      if (response['success']) {
        _availableSlots = List<String>.from(response['data']['slots']);
      } else {
        _setError(response['message'] ?? 'Failed to fetch available slots');
      }
    } catch (e) {
      _setError(_getErrorMessage(e));
    } finally {
      _setLoading(false);
    }
  }

  Future<void> fetchCurrentQueue() async {
    try {
      final response = await _apiService.get(ApiConstants.queueCurrent);

      if (response['success'] && response['data'] != null) {
        _currentQueue = Queue.fromJson(response['data']);
      } else {
        _currentQueue = null;
      }
      notifyListeners();
    } catch (e) {
      _currentQueue = null;
      notifyListeners();
    }
  }

  Future<bool> bookQueue({
    required DateTime appointmentDate,
    required String timeSlot,
    String? notes,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.post(
        ApiConstants.queueBook,
        requireAuth: true,
        body: {
          'appointmentDate': appointmentDate.toIso8601String().split('T')[0],
          'timeSlot': timeSlot,
          if (notes != null) 'notes': notes,
        },
      );

      if (response['success']) {
        await fetchMyQueues(); // Refresh the queue list
        _setLoading(false);
        return true;
      } else {
        _setError(response['message'] ?? 'Failed to book queue');
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError(_getErrorMessage(e));
      _setLoading(false);
      return false;
    }
  }

  Future<bool> cancelQueue(String queueId) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.patch(
        ApiConstants.queueCancel(queueId),
        requireAuth: true,
      );

      if (response['success']) {
        await fetchMyQueues(); // Refresh the queue list
        _setLoading(false);
        return true;
      } else {
        _setError(response['message'] ?? 'Failed to cancel queue');
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError(_getErrorMessage(e));
      _setLoading(false);
      return false;
    }
  }

  void updateQueueFromSocket(Map<String, dynamic> data) {
    try {
      final updatedQueue = Queue.fromJson(data);
      
      // Update in myQueues list
      final index = _myQueues.indexWhere((q) => q.id == updatedQueue.id);
      if (index != -1) {
        _myQueues[index] = updatedQueue;
      }

      // Update current queue if it matches
      if (_currentQueue?.id == updatedQueue.id) {
        _currentQueue = updatedQueue;
      }

      notifyListeners();
    } catch (e) {
      debugPrint('Error updating queue from socket: $e');
    }
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _errorMessage = error;
    notifyListeners();
  }

  void _clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  String _getErrorMessage(dynamic error) {
    if (error is ApiException) {
      return error.message;
    }
    return 'Terjadi kesalahan. Silakan coba lagi.';
  }
}