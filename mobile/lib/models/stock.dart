class Stock {
  final String stockId;
  final int tokyo;
  final int sanstha;
  final int atlas;
  final int nipon;
  final int totalNumber;

  Stock({
    required this.stockId,
    this.tokyo = 0,
    this.sanstha = 0,
    this.atlas = 0,
    this.nipon = 0,
    this.totalNumber = 0,
  });

  factory Stock.fromJson(Map<String, dynamic> json) {
    return Stock(
      stockId: json['stockId'] as String,
      tokyo: json['tokyo'] as int? ?? 0,
      sanstha: json['sanstha'] as int? ?? 0,
      atlas: json['atlas'] as int? ?? 0,
      nipon: json['nipon'] as int? ?? 0,
      totalNumber: json['totalNumber'] as int? ?? 0,
    );
  }
}

