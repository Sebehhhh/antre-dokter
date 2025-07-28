import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';

import 'core/constants/app_colors.dart';
import 'features/auth/providers/auth_provider.dart';
import 'features/queue/providers/queue_provider.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/auth/screens/register_screen.dart';
import 'features/queue/screens/home_screen.dart';
import 'features/queue/screens/queue_booking_screen.dart';
import 'features/queue/screens/my_queues_screen.dart';
import 'core/services/socket_service.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => QueueProvider()),
      ],
      child: Consumer<AuthProvider>(
        builder: (context, authProvider, _) {
          return MaterialApp.router(
            title: 'AntreDokter',
            theme: ThemeData(
              colorScheme: ColorScheme.fromSeed(
                seedColor: AppColors.primary,
                brightness: Brightness.light,
              ),
              fontFamily: 'Inter',
              appBarTheme: const AppBarTheme(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                elevation: 0,
              ),
              elevatedButtonTheme: ElevatedButtonThemeData(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
              useMaterial3: true,
            ),
            routerConfig: _createRouter(authProvider),
          );
        },
      ),
    );
  }

  GoRouter _createRouter(AuthProvider authProvider) {
    return GoRouter(
      initialLocation: '/',
      redirect: (context, state) {
        final isAuthenticated = authProvider.isAuthenticated;
        final isGoingToAuth = state.matchedLocation.startsWith('/auth');

        // Check auth status if unknown
        if (authProvider.status == AuthStatus.unknown) {
          authProvider.checkAuthStatus();
          return null;
        }

        // Redirect to home if authenticated and trying to access auth pages
        if (isAuthenticated && isGoingToAuth) {
          return '/';
        }

        // Redirect to login if not authenticated and trying to access protected pages
        if (!isAuthenticated && !isGoingToAuth) {
          return '/auth/login';
        }

        return null;
      },
      routes: [
        GoRoute(
          path: '/',
          builder: (context, state) => const HomeScreen(),
        ),
        GoRoute(
          path: '/auth/login',
          builder: (context, state) => const LoginScreen(),
        ),
        GoRoute(
          path: '/auth/register',
          builder: (context, state) => const RegisterScreen(),
        ),
        GoRoute(
          path: '/queue/book',
          builder: (context, state) => const QueueBookingScreen(),
        ),
        GoRoute(
          path: '/queue/my-queues',
          builder: (context, state) => const MyQueuesScreen(),
        ),
      ],
    );
  }
}

class AppInitializer extends StatefulWidget {
  final Widget child;

  const AppInitializer({super.key, required this.child});

  @override
  State<AppInitializer> createState() => _AppInitializerState();
}

class _AppInitializerState extends State<AppInitializer> {
  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    final authProvider = context.read<AuthProvider>();
    await authProvider.checkAuthStatus();

    if (authProvider.isAuthenticated) {
      await SocketService().connect();
    }
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}