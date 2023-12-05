import 'package:realm/realm.dart';
import 'models.dart';

Realm getRealm() {
  var config = Configuration.local([ClipboardItem.schema]);
  var realm = Realm(config);
  return realm;
}
