class Customer {
  final String customerId;
  final String customerName;
  final String? location;
  final String? contactNumber;
  final double pastBills;

  Customer({
    required this.customerId,
    required this.customerName,
    this.location,
    this.contactNumber,
    this.pastBills = 0.0,
  });

  factory Customer.fromJson(Map<String, dynamic> json) {
    return Customer(
      customerId: json['customerId'] as String,
      customerName: json['customerName'] as String,
      location: json['location'] as String?,
      contactNumber: json['contactNumber'] as String?,
      pastBills: (json['pastBills'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'customerName': customerName,
      'location': location,
      'contactNumber': contactNumber,
      'pastBills': pastBills,
    };
  }
}

