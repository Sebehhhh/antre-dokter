import 'package:flutter/foundation.dart';
import '../../../core/models/user_model.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/constants/api_constants.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  final StorageService _storageService = StorageService();

  AuthStatus _status = AuthStatus.unknown;
  User? _user;
  String? _errorMessage;
  bool _isLoading = false;

  AuthStatus get status => _status;
  User? get user => _user;
  String? get errorMessage => _errorMessage;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _status == AuthStatus.authenticated;

  Future<void> checkAuthStatus() async {
    try {
      final token = await _storageService.getToken();
      final user = await _storageService.getUser();

      if (token != null && user != null) {
        // Verify token is still valid
        await _verifyToken();
      } else {
        _status = AuthStatus.unauthenticated;
      }
    } catch (e) {
      _status = AuthStatus.unauthenticated;
      await _clearAuthData();
    }
    notifyListeners();
  }

  Future<void> _verifyToken() async {
    try {
      final response = await _apiService.get(
        ApiConstants.authMe,
        requireAuth: true,
      );

      if (response['success']) {
        _user = User.fromJson(response['data']);
        _status = AuthStatus.authenticated;
      } else {
        throw Exception('Token verification failed');
      }
    } catch (e) {
      _status = AuthStatus.unauthenticated;
      await _clearAuthData();
      rethrow;
    }
  }

  Future<bool> login(String email, String password) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.post(
        ApiConstants.authLogin,
        body: {
          'email': email,
          'password': password,
        },
      );

      if (response['success']) {
        final token = response['data']['token'];
        final userData = response['data']['user'];

        await _storageService.saveToken(token);
        _user = User.fromJson(userData);
        await _storageService.saveUser(_user!);

        _status = AuthStatus.authenticated;
        _setLoading(false);
        return true;
      } else {
        _setError(response['message'] ?? 'Login failed');
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError(_getErrorMessage(e));
      _setLoading(false);
      return false;
    }
  }

  Future<bool> register({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.post(
        ApiConstants.authRegister,
        body: {
          'name': name,
          'email': email,
          'password': password,
          if (phone != null) 'phone': phone,
        },
      );

      if (response['success']) {
        final token = response['data']['token'];
        final userData = response['data']['user'];

        await _storageService.saveToken(token);
        _user = User.fromJson(userData);
        await _storageService.saveUser(_user!);

        _status = AuthStatus.authenticated;
        _setLoading(false);
        return true;
      } else {
        _setError(response['message'] ?? 'Registration failed');
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError(_getErrorMessage(e));
      _setLoading(false);
      return false;
    }
  }

  Future<void> logout() async {
    _setLoading(true);
    await _clearAuthData();
    _status = AuthStatus.unauthenticated;
    _user = null;
    _setLoading(false);
  }

  Future<void> _clearAuthData() async {
    await _storageService.clearAll();
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