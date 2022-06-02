import 'package:realm/realm.dart';
import 'package:unity/models.dart';

void addTextItemToDb(Realm realm, String text) {
  final results = realm.all<ClipboardItem>().query(r"text == $0", [text]);
  if (results.isNotEmpty) {
    realm.write(() {
      realm.deleteMany(results);
    });
  }

  final timestamp = DateTime.now().millisecondsSinceEpoch;
  var item = ClipboardItem(text, timestamp);
  realm.write(() {
    realm.add(item);
  });
}
