import ParallaxScrollView from "@/components/parallax-scroll-view";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import api from "@/lib/axios";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.92;

/* ================= TYPES ================= */

interface Product {
  name: string;
  quantity: number;
  price: number;
}

interface PackageImage {
  publicId: string;
  url: string;
}

interface Purchase {
  id: string;
  packageImages: PackageImage[];
  paymentMethod: string;
  platform: string;
  products: Product[] | null;
  purchaseDate: string;
  receivedDate: string;
  totalAmount: number;
}

/* ================= MAIN ================= */

export default function Payment() {
  const [list, setList] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const res = await api.get("/purchases/search");
      setList(res.data.data || []);
    } catch (err) {
      console.log("Fetch purchase error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= ACTIONS ================= */

  const onEdit = (item: Purchase) => {
    router.push(`/edit/${item.id}`);
  };

  const onDelete = (id: string) => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc muốn xóa đơn hàng này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/purchases/${id}`);
            setList((prev) => prev.filter((i) => i.id !== id));
          } catch (err) {
            console.log("Delete error:", err);
          }
        },
      },
    ]);
  };

  /* ================= IMAGE GRID ================= */

  const renderImages = (images: PackageImage[]) => {
    if (!images || images.length === 0) return null;

    const imageWidth =
      images.length === 1 ? "100%" : images.length === 2 ? "48%" : "31%";

    return (
      <View style={styles.imageGrid}>
        {images.map((img) => (
          <Image
            key={img.publicId}
            source={{ uri: img.url }}
            style={[styles.gridImage, { width: imageWidth }]}
          />
        ))}
      </View>
    );
  };

  /* ================= RENDER ================= */

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <Text style={styles.title}>Lịch Sử Mua Hàng Online</Text>
      <Button title="Thêm Mới" onPress={() => router.push("/create")} />

      {loading && <ActivityIndicator size="large" color="#FF5733" />}

      {!loading && list.length === 0 && (
        <Text style={styles.empty}>Chưa có đơn hàng nào</Text>
      )}

      {!loading &&
        list.map((item) => (
          <View key={item.id} style={styles.card}>
            {/* ACTION BUTTONS */}
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={() => onEdit(item)}>
                <Text style={styles.edit}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(item.id)}>
                <Text style={styles.delete}>🗑️</Text>
              </TouchableOpacity>
            </View>

            {renderImages(item.packageImages)}

            <Text style={styles.platform}>{item.platform}</Text>
            <Text style={styles.payment}>Thanh toán: {item.paymentMethod}</Text>

            <Text style={styles.date}>
              Ngày mua: {item.purchaseDate} | Nhận: {item.receivedDate}
            </Text>

            <Text style={styles.total}>
              Tổng tiền: {item.totalAmount.toLocaleString()} ₫
            </Text>

            {item.products && (
              <View style={styles.productBox}>
                {item.products.map((p, i) => (
                  <Text key={i} style={styles.product}>
                    • {p.name} x{p.quantity} — {p.price.toLocaleString()} ₫
                  </Text>
                ))}
              </View>
            )}
          </View>
        ))}
    </ParallaxScrollView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  headerImage: {
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FF5733",
    marginBottom: 20,
  },
  empty: {
    textAlign: "center",
    color: "#777",
    marginTop: 20,
  },
  card: {
    width: CARD_WIDTH,
    alignSelf: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 16,
    marginBottom: 18,
    elevation: 3,
  },
  actionRow: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    gap: 10,
    zIndex: 10,
  },
  edit: { fontSize: 18 },
  delete: { fontSize: 18 },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  gridImage: {
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#eee",
  },
  platform: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  payment: {
    fontSize: 13,
    color: "#444",
  },
  date: {
    fontSize: 12,
    color: "#666",
    marginTop: 3,
  },
  total: {
    marginTop: 6,
    color: "#E74C3C",
    fontWeight: "bold",
  },
  productBox: {
    marginTop: 8,
    paddingLeft: 5,
  },
  product: {
    fontSize: 13,
    color: "#555",
  },
});
