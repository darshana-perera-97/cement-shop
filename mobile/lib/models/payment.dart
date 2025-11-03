class Payment {
  final String customerId;
  final String customerName;
  final double amount;
  final String date;
  final String? notes;

  Payment({
    required this.customerId,
    required this.customerName,
    required this.amount,
    required this.date,
    this.notes,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      customerId: json['customerId'] as String,
      customerName: json['customerName'] as String,
      amount: (json['amount'] ?? 0).toDouble(),
      date: json['date'] as String,
      notes: json['notes'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'customerId': customerId,
      'customerName': customerName,
      'amount': amount,
      'date': date,
      'notes': notes,
    };
  }
}

