import 'package:realm/realm.dart';
import 'models.dart';

Realm getRealm() {
  var config = Configuration([ClipboardItem.schema]);
  return Realm(config);
}
