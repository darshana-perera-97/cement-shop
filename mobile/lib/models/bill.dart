class BillItem {
  final String name;
  final double bags;
  final double unitPrice;
  final double total;

  BillItem({
    required this.name,
    required this.bags,
    required this.unitPrice,
    required this.total,
  });

  factory BillItem.fromJson(Map<String, dynamic> json) {
    return BillItem(
      name: json['name'] as String,
      bags: (json['bags'] ?? 0).toDouble(),
      unitPrice: (json['unitPrice'] ?? 0).toDouble(),
      total: (json['total'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'bags': bags,
      'unitPrice': unitPrice,
      'total': total,
    };
  }
}

class Bill {
  final String customerId;
  final String customerName;
  final String? stockNumber;
  final String date;
  final List<BillItem> items;
  final double billTotal;
  final String? createdAt;

  Bill({
    required this.customerId,
    required this.customerName,
    this.stockNumber,
    required this.date,
    required this.items,
    required this.billTotal,
    this.createdAt,
  });

  factory Bill.fromJson(Map<String, dynamic> json) {
    return Bill(
      customerId: json['customerId'] as String,
      customerName: json['customerName'] as String,
      stockNumber: json['stockNumber'] as String?,
      date: json['date'] as String,
      items: (json['items'] as List<dynamic>?)
              ?.map((item) => BillItem.fromJson(item as Map<String, dynamic>))
              .toList() ??
          [],
      billTotal: (json['billTotal'] ?? 0).toDouble(),
      createdAt: json['createdAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    final map = {
      'customerId': customerId,
      'customerName': customerName,
      'stockNumber': stockNumber,
      'date': date,
      'items': items.map((item) => item.toJson()).toList(),
      'billTotal': billTotal,
    };
    if (createdAt != null) {
      map['createdAt'] = createdAt;
    }
    return map;
  }
}

