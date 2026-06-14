import api from "@/lib/axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import {
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

/* ================= TYPES ================= */
interface Product {
  name: string;
  quantity: number;
  price: number;
}

interface UploadedImage {
  url: string;
  publicId: string;
}

/* ================= OPTIONS ================= */
export const PLATFORM_OPTIONS = [
  { label: "Shoppe Shop", value: "Shoppe Shop" },
  { label: "TikTok Shop", value: "TikTok Shop" },
  { label: "Lazada Shop", value: "Lazada Shop" },
  { label: "Tiki", value: "Tiki" },
  { label: "Sendo", value: "Sendo" },
  { label: "Facebook", value: "Facebook" },
  { label: "Zalo", value: "Zalo" },
  { label: "Instagram", value: "Instagram" },
  { label: "Chợ Tốt", value: "Chợ Tốt" },
  { label: "Website riêng", value: "Website riêng" },
  { label: "Khác", value: "Khác" },
];

export const PAYMENT_METHOD_OPTIONS = [
  { label: "Chuyển khoản", value: "Chuyển khoản" },
  { label: "Tiền mặt", value: "Tiền mặt" },
];

/* ================= CARD ================= */
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
  const [packageImages, setPackageImages] = useState<UploadedImage[]>([]);

  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [receivedDate, setReceivedDate] = useState(new Date());

  const [showPurchasePicker, setShowPurchasePicker] = useState(false);
  const [showReceivedPicker, setShowReceivedPicker] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const originalImagesRef = React.useRef<UploadedImage[]>([]);
  const isSavedRef = React.useRef(false);

  /* ================= FETCH DETAIL ================= */

  const fetchDetail = React.useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);

      const res = await api.get(`/purchases/${id}`);
      const d = res.data.data;

      const imgs: UploadedImage[] = d.packageImages ?? [];

      // ⭐ snapshot BẢN SAO – KHÔNG dính reference
      originalImagesRef.current = imgs.map((i) => ({ ...i }));

      setPlatform(d.platform ?? "");
      setPaymentMethod(d.paymentMethod ?? "");
      setProducts(d.products ?? []);
      setPackageImages(imgs.map((i) => ({ ...i })));
      setPurchaseDate(new Date(d.purchaseDate));
      setReceivedDate(new Date(d.receivedDate));
    } catch (e) {
      Alert.alert("❌ Lỗi", "Không load được dữ liệu");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (isSavedRef.current) return;

        const original = originalImagesRef.current;
        const current = packageImages;

        const newImages = current.filter(
          (img) => !original.some((o) => o.publicId === img.publicId),
        );

        if (!newImages.length) return;

        api
          .delete("/upload/images", {
            params: {
              publicIds: newImages.map((i) => i.publicId),
            },
          })
          .catch(() => {
            console.log("Cleanup edit images failed");
          });
      };
    }, [packageImages]),
  );

  useEffect(() => {
    if (!id) return;
    fetchDetail();
  }, [id, fetchDetail]);

  /* ================= PRODUCTS ================= */
  const addProduct = () =>
    setProducts([...products, { name: "", quantity: 1, price: 0 }]);

  const removeProduct = (index: number) =>
    setProducts(products.filter((_, i) => i !== index));

  const updateProduct = (
    index: number,
    field: keyof Product,
    value: string,
  ) => {
    setProducts((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: field === "name" ? value : Number(value) || 0,
            }
          : item,
      ),
    );
  };

  /* ================= IMAGE PICK & UPLOAD ================= */
  const pickAndUploadImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Không có quyền truy cập ảnh");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (result.canceled) return;

      const formData = new FormData();
      result.assets.forEach((asset, index) => {
        formData.append("images", {
          uri: asset.uri,
          name: `upload_${index}.jpg`,
          type: "image/jpeg",
        } as any);
      });

      setUploading(true);
      setUploadProgress(0);

      const res = await api.post("/upload/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (!e.total) return;
          const percent = Math.round((e.loaded * 100) / e.total);
          setUploadProgress(Math.min(percent, 100));
        },
      });

      setPackageImages((prev) => [...prev, ...res.data.data]);
    } catch {
      Alert.alert("❌ Upload ảnh thất bại");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteImage = async (publicId: string, index: number) => {
    try {
      await api.delete("/upload/images", {
        params: { publicIds: [publicId] },
      });
      setPackageImages((prev) => prev.filter((_, i) => i !== index));
    } catch {
      Alert.alert("❌", "Xóa ảnh thất bại");
    }
  };

  /* ================= TOTAL ================= */
  const totalAmount = products.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0,
  );

  /* ================= SAVE ================= */
  const save = async () => {
    try {
      const original = originalImagesRef.current;
      const current = packageImages;

      const removedImages = original.filter(
        (o) => !current.some((c) => c.publicId === o.publicId),
      );

      if (removedImages.length) {
        await api.delete("/upload/images", {
          params: {
            publicIds: removedImages.map((i) => i.publicId),
          },
        });
      }

      await api.put(`/purchases/${id}`, {
        platform,
        paymentMethod,
        products,
        packageImages,
        purchaseDate: purchaseDate.toISOString().slice(0, 10),
        receivedDate: receivedDate.toISOString().slice(0, 10),
        totalAmount,
      });

      isSavedRef.current = true;
      Alert.alert("✅ Thành công", "Đã cập nhật đơn hàng");
      router.replace("/(tabs)/payment");
    } catch {
      Alert.alert("❌ Lỗi", "Không thể lưu dữ liệu");
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <View style={{ marginTop: 60 }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  /* ================= UI ================= */
  return (
    <>
      <Stack.Screen
        options={{
          title: "Sửa đơn hàng",
          headerStyle: { backgroundColor: "#3498db" },
          headerTintColor: "#fff",
        }}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        enableOnAndroid
        keyboardShouldPersistTaps="always"
        extraScrollHeight={150}
        enableAutomaticScroll
      >
        <Text style={styles.title}>Sửa đơn hàng</Text>

        <Card title="🧾 Thông tin đơn hàng">
          <Picker selectedValue={platform} onValueChange={setPlatform}>
            <Picker.Item label="-- Chọn platform --" value="" />
            {PLATFORM_OPTIONS.map((i) => (
              <Picker.Item key={i.value} label={i.label} value={i.value} />
            ))}
          </Picker>

          <Picker
            selectedValue={paymentMethod}
            onValueChange={setPaymentMethod}
          >
            <Picker.Item label="-- Chọn hình thức --" value="" />
            {PAYMENT_METHOD_OPTIONS.map((i) => (
              <Picker.Item key={i.value} label={i.label} value={i.value} />
            ))}
          </Picker>
        </Card>

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

        <Card title="🖼️ Hình ảnh kiện hàng">
          {packageImages.map((img, i) => (
            <View key={img.publicId} style={styles.subItem}>
              <Image source={{ uri: img.url }} style={styles.image} />
              <Text
                style={styles.remove}
                onPress={() => deleteImage(img.publicId, i)}
              >
                ❌ Xóa ảnh
              </Text>
            </View>
          ))}

          {uploading && (
            <View>
              <Text>Uploading... {uploadProgress}%</Text>
              <View style={styles.progressBg}>
                <View
                  style={[styles.progressFill, { width: `${uploadProgress}%` }]}
                />
              </View>
            </View>
          )}

          <TouchableOpacity onPress={pickAndUploadImage}>
            <Text style={styles.add}>➕ Chọn & Upload ảnh</Text>
          </TouchableOpacity>
        </Card>

        <Card title="📦 Sản phẩm">
          {products.map((p, i) => (
            <View key={i} style={styles.productCard}>
              <TextInput
                style={styles.input}
                placeholder="Tên sản phẩm"
                value={p.name}
                onChangeText={(t) => updateProduct(i, "name", t)}
              />
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

        <Card title="💰 Tổng tiền">
          <Text style={styles.total}>{totalAmount.toLocaleString()} ₫</Text>
        </Card>

        <Card title="⚙️ Hành động">
          <TouchableOpacity style={styles.save} onPress={save}>
            <Text style={styles.saveText}>💾 Lưu thay đổi</Text>
          </TouchableOpacity>
        </Card>
      </KeyboardAwareScrollView>
    </>
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
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
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
  image: { width: "100%", height: 150, borderRadius: 8 },
  date: { fontSize: 15, marginBottom: 6 },
  total: { fontSize: 20, fontWeight: "bold" },
  save: { backgroundColor: "#3498db", padding: 14, borderRadius: 10 },
  saveText: { color: "#fff", textAlign: "center", fontSize: 16 },
  progressBg: {
    height: 6,
    backgroundColor: "#ddd",
    borderRadius: 3,
    marginTop: 4,
  },
  progressFill: {
    height: 6,
    backgroundColor: "#3498db",
    borderRadius: 3,
  },
});
