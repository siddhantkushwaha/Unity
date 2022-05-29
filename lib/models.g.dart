// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'models.dart';

// **************************************************************************
// RealmObjectGenerator
// **************************************************************************

class ClipboardItem extends _ClipboardItem with RealmEntity, RealmObject {
  ClipboardItem(
    String text,
  ) {
    RealmObject.set(this, 'text', text);
  }

  ClipboardItem._();

  @override
  String get text => RealmObject.get<String>(this, 'text') as String;
  @override
  set text(String value) => RealmObject.set(this, 'text', value);

  @override
  Stream<RealmObjectChanges<ClipboardItem>> get changes =>
      RealmObject.getChanges<ClipboardItem>(this);

  static SchemaObject get schema => _schema ??= _initSchema();
  static SchemaObject? _schema;
  static SchemaObject _initSchema() {
    RealmObject.registerFactory(ClipboardItem._);
    return const SchemaObject(ClipboardItem, [
      SchemaProperty('text', RealmPropertyType.string),
    ]);
  }
}
