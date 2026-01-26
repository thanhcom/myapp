import api from "@/lib/axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

/* ================= TYPES ================= */
interface Product {
  name: string;
  quantity: number;
  price: number;
}

/* ================= CARD COMPONENT ================= */
const Card = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

/* ================= MAIN ================= */
export default function EditPurchase() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [loading, setLoading] = useState(true);

  const [platform, setPlatform] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [packageImageUrls, setPackageImageUrls] = useState<string[]>([]);
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [receivedDate, setReceivedDate] = useState(new Date());

  const [showPurchasePicker, setShowPurchasePicker] = useState(false);
  const [showReceivedPicker, setShowReceivedPicker] = useState(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!id) return;
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/purchases/${id}`);
      const d = res.data.data;

      setPlatform(d.platform ?? "");
      setPaymentMethod(d.paymentMethod ?? "");
      setProducts(d.products ?? []);
      setPackageImageUrls(d.packageImageUrls ?? []);
      setPurchaseDate(new Date(d.purchaseDate));
      setReceivedDate(new Date(d.receivedDate));
    } catch (e) {
      Alert.alert("Lỗi", "Không load được dữ liệu");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  /* ================= PRODUCT ================= */
  const addProduct = () =>
    setProducts([...products, { name: "", quantity: 1, price: 0 }]);

  const removeProduct = (index: number) =>
    setProducts(products.filter((_, i) => i !== index));

  const updateProduct = (
    index: number,
    field: keyof Product,
    value: string,
  ) => {
    const clone = [...products];
    clone[index][field] = field === "name" ? value : Number(value) || 0;
    setProducts(clone);
  };

  /* ================= IMAGE ================= */
  const addImage = () => setPackageImageUrls([...packageImageUrls, ""]);

  const removeImage = (index: number) =>
    setPackageImageUrls(packageImageUrls.filter((_, i) => i !== index));

  const updateImage = (index: number, url: string) => {
    const clone = [...packageImageUrls];
    clone[index] = url;
    setPackageImageUrls(clone);
  };

  /* ================= TOTAL ================= */
  const totalAmount = products.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0,
  );

  /* ================= SAVE ================= */
  const save = async () => {
    try {
      await api.put(`/purchases/${id}`, {
        platform,
        paymentMethod,
        products,
        packageImageUrls,
        purchaseDate: purchaseDate.toISOString().slice(0, 10),
        receivedDate: receivedDate.toISOString().slice(0, 10),
        totalAmount,
      });

      Alert.alert("✅ Thành công", "Đã cập nhật đơn hàng");
      router.replace("/(tabs)/payment");
    } catch (e) {
      Alert.alert("Lỗi", "Không thể lưu dữ liệu");
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <View style={{ marginTop: 50 }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  /* ================= UI ================= */
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Sửa đơn hàng</Text>

        {/* ===== BASIC INFO ===== */}
        <Card title="🧾 Thông tin đơn hàng">
          <TextInput
            style={styles.input}
            placeholder="Platform"
            value={platform}
            onChangeText={setPlatform}
          />
          <TextInput
            style={styles.input}
            placeholder="Payment Method"
            value={paymentMethod}
            onChangeText={setPaymentMethod}
          />
        </Card>

        {/* ===== DATE ===== */}
        <Card title="📅 Thời gian">
          <Text style={styles.date} onPress={() => setShowPurchasePicker(true)}>
            Ngày mua: {purchaseDate.toLocaleDateString()}
          </Text>
          <Text style={styles.date} onPress={() => setShowReceivedPicker(true)}>
            Ngày nhận: {receivedDate.toLocaleDateString()}
          </Text>
        </Card>

        {showPurchasePicker && (
          <DateTimePicker
            value={purchaseDate}
            mode="date"
            onChange={(_, d) => {
              setShowPurchasePicker(false);
              d && setPurchaseDate(d);
            }}
          />
        )}

        {showReceivedPicker && (
          <DateTimePicker
            value={receivedDate}
            mode="date"
            onChange={(_, d) => {
              setShowReceivedPicker(false);
              d && setReceivedDate(d);
            }}
          />
        )}

        {/* ===== IMAGES ===== */}
        <Card title="🖼️ Hình ảnh kiện hàng">
          {packageImageUrls.map((url, i) => (
            <View key={i} style={styles.subItem}>
              {!!url && <Image source={{ uri: url }} style={styles.image} />}
              <TextInput
                style={styles.input}
                placeholder="Image URL"
                value={url}
                onChangeText={(t) => updateImage(i, t)}
              />
              <Text style={styles.remove} onPress={() => removeImage(i)}>
                ❌ Xóa ảnh
              </Text>
            </View>
          ))}
          <Text style={styles.add} onPress={addImage}>
            ➕ Thêm ảnh
          </Text>
        </Card>

        {/* ===== PRODUCTS ===== */}
        <Card title="📦 Sản phẩm">
          {products.map((p, i) => (
            <View key={i} style={styles.productCard}>
              <Text style={{ fontWeight: "bold", color: "blue" }}>
                Tên sản phẩm
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Tên sản phẩm"
                value={p.name}
                onChangeText={(t) => updateProduct(i, "name", t)}
              />
              <View>
                <Text style={{ fontWeight: "bold", color: "blue" }}>
                  Số lượng - Giá Tiền
                </Text>
              </View>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.half]}
                  keyboardType="numeric"
                  placeholder="SL"
                  value={String(p.quantity)}
                  onChangeText={(t) => updateProduct(i, "quantity", t)}
                />
                <TextInput
                  style={[styles.input, styles.half]}
                  keyboardType="numeric"
                  placeholder="Giá"
                  value={String(p.price)}
                  onChangeText={(t) => updateProduct(i, "price", t)}
                />
              </View>
              <Text style={styles.remove} onPress={() => removeProduct(i)}>
                ❌ Xóa sản phẩm
              </Text>
            </View>
          ))}
          <Text style={styles.add} onPress={addProduct}>
            ➕ Thêm sản phẩm
          </Text>
        </Card>

        {/* ===== TOTAL ===== */}
        <Card title="💰 Tổng tiền">
          <Text style={styles.total}>{totalAmount.toLocaleString()} ₫</Text>
        </Card>

        {/* ===== ACTION ===== */}
        <Card title="⚙️ Hành động">
          <TouchableOpacity style={styles.save} onPress={save}>
            <Text style={styles.saveText}>💾 Lưu thay đổi</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ================= STYLE ================= */
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#f3f4f6" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#34495e",
  },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 2,
  },
  cardTitle: { fontSize: 17, fontWeight: "bold", marginBottom: 10 },

  input: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },

  subItem: { marginBottom: 10 },

  productCard: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f4f6f8",
    marginBottom: 10,
  },

  row: { flexDirection: "row", gap: 8 },
  half: { flex: 1 },

  add: { color: "#2ecc71", fontWeight: "bold", marginTop: 6 },
  remove: { color: "#e74c3c", marginTop: 4 },

  image: { width: "100%", height: 150, borderRadius: 8, marginBottom: 6 },

  date: { fontSize: 15, marginBottom: 6 },

  total: { fontSize: 20, fontWeight: "bold" },

  back: { fontSize: 16, marginBottom: 10 },

  save: {
    backgroundColor: "#3498db",
    padding: 14,
    borderRadius: 10,
  },
  saveText: { color: "#fff", textAlign: "center", fontSize: 16 },
});
