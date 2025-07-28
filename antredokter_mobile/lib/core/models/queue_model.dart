import 'package:equatable/equatable.dart';

enum QueueStatus { waiting, active, completed, cancelled }

class Queue extends Equatable {
  final String id;
  final String patientId;
  final String patientName;
  final String? patientPhone;
  final int queueNumber;
  final DateTime appointmentDate;
  final String timeSlot;
  final QueueStatus status;
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Queue({
    required this.id,
    required this.patientId,
    required this.patientName,
    this.patientPhone,
    required this.queueNumber,
    required this.appointmentDate,
    required this.timeSlot,
    required this.status,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Queue.fromJson(Map<String, dynamic> json) {
    return Queue(
      id: json['id'].toString(),
      patientId: json['patientId'].toString(),
      patientName: json['patientName'],
      patientPhone: json['patientPhone'],
      queueNumber: json['queueNumber'],
      appointmentDate: DateTime.parse(json['appointmentDate']),
      timeSlot: json['timeSlot'],
      status: _statusFromString(json['status']),
      notes: json['notes'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  static QueueStatus _statusFromString(String status) {
    switch (status.toLowerCase()) {
      case 'waiting':
        return QueueStatus.waiting;
      case 'active':
        return QueueStatus.active;
      case 'completed':
        return QueueStatus.completed;
      case 'cancelled':
        return QueueStatus.cancelled;
      default:
        return QueueStatus.waiting;
    }
  }

  String get statusString {
    switch (status) {
      case QueueStatus.waiting:
        return 'waiting';
      case QueueStatus.active:
        return 'active';
      case QueueStatus.completed:
        return 'completed';
      case QueueStatus.cancelled:
        return 'cancelled';
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'patientId': patientId,
      'patientName': patientName,
      'patientPhone': patientPhone,
      'queueNumber': queueNumber,
      'appointmentDate': appointmentDate.toIso8601String(),
      'timeSlot': timeSlot,
      'status': statusString,
      'notes': notes,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  Queue copyWith({
    String? id,
    String? patientId,
    String? patientName,
    String? patientPhone,
    int? queueNumber,
    DateTime? appointmentDate,
    String? timeSlot,
    QueueStatus? status,
    String? notes,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Queue(
      id: id ?? this.id,
      patientId: patientId ?? this.patientId,
      patientName: patientName ?? this.patientName,
      patientPhone: patientPhone ?? this.patientPhone,
      queueNumber: queueNumber ?? this.queueNumber,
      appointmentDate: appointmentDate ?? this.appointmentDate,
      timeSlot: timeSlot ?? this.timeSlot,
      status: status ?? this.status,
      notes: notes ?? this.notes,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        patientId,
        patientName,
        patientPhone,
        queueNumber,
        appointmentDate,
        timeSlot,
        status,
        notes,
        createdAt,
        updatedAt,
      ];
}