import ParallaxScrollView from "@/components/parallax-scroll-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import api from "@/lib/axios";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
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
  const [loading, setLoading] = useState(false);
  const [inputPage, setInputPage] = useState("");

  const [pageNum, setPageNum] = useState(0); // BẮT ĐẦU = 0
  const [pageSize] = useState(2);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const fetchPurchases = useCallback(
    async (page: number) => {
      if (loading) return;
      try {
        const res = await api.get("/purchases/search", {
          params: { page, size: pageSize },
        });

        setList(res.data.data || []);
        setPageNum(res.data.pageInfo.currentPage - 1);
        setTotalPages(res.data.pageInfo.totalPage);
        setHasNext(res.data.pageInfo.hasNext);
        setHasPrevious(res.data.pageInfo.hasPrevious);
      } finally {
        setLoading(false);
      }
    },
    [loading, pageSize],
  );

  useEffect(() => {
    fetchPurchases(0);
  }, [fetchPurchases]);

  // Kiểm tra có trang tiếp theo không
  const nextPage = () => {
    if (pageNum + 1 < totalPages) {
      fetchPurchases(pageNum + 1);
    }
  };
  //
  const prevPage = () => {
    if (pageNum > 0) {
      fetchPurchases(pageNum - 1);
    }
  };
  // Đi đến trang cụ thể
  const goToPage = () => {
    const page = Number(inputPage);

    // validate
    if (isNaN(page)) {
      Alert.alert("Lỗi", "Nhập số trang hợp lệ");
      return;
    }

    // UI nhập 1-based, backend 0-based
    const targetPage = page - 1;

    if (targetPage < 0 || targetPage >= totalPages) {
      Alert.alert("Lỗi", "Trang không tồn tại");
      return;
    }

    fetchPurchases(targetPage);
    setInputPage("");
  };

  /* ================= ACTIONS ================= */

  const onEdit = (item: Purchase) => {
    router.push(`/edit/${item.id}`);
  };

  const onDelete = (purchase: Purchase) => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc muốn xóa đơn hàng này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            // 1️⃣ Xóa ảnh
            const publicIds = purchase.packageImages?.map((i) => i.publicId);

            if (publicIds?.length) {
              await api.delete("/upload/images", {
                params: { publicIds },
              });
            }

            // 2️⃣ Xóa purchase
            await api.delete(`/purchases/${purchase.id}`);

            // 3️⃣ Update UI
            setList((prev) => prev.filter((i) => i.id !== purchase.id));
          } catch (err) {
            console.log("Delete error:", err);
            Alert.alert("❌ Lỗi", "Xóa đơn hàng thất bại");
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
      headerBackgroundColor={{ light: "#d8eff3", dark: "#0d1368" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#d0acb9"
          name="cart.fill"
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
              <TouchableOpacity onPress={() => onDelete(item)}>
                <Text style={styles.delete}>🗑️</Text>
              </TouchableOpacity>
            </View>

            {renderImages(item.packageImages)}

            <Text style={styles.platform}>Đơn Mua Tại : {item.platform}</Text>
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
      {/* PAGINATION */}
      <View style={styles.paginationWrapper}>
        {/* HÀNG 1: PREV - INFO - NEXT */}
        <View style={styles.pagination}>
          <TouchableOpacity
            onPress={prevPage}
            disabled={!hasPrevious || loading}
            style={[styles.pageBtn, !hasPrevious && styles.disabled]}
          >
            <Text style={styles.pageText}>◀ Prev</Text>
          </TouchableOpacity>

          <Text style={styles.pageInfo}>
            Trang {pageNum + 1} / {totalPages}
          </Text>

          <TouchableOpacity
            onPress={nextPage}
            disabled={!hasNext || loading}
            style={[styles.pageBtn, !hasNext && styles.disabled]}
          >
            <Text style={styles.pageText}>Next ▶</Text>
          </TouchableOpacity>
        </View>

        {/* HÀNG 2: GOTO PAGE */}
        <View style={styles.gotoBox}>
          <Text>Đi tới:</Text>

          <TextInput
            value={inputPage}
            onChangeText={setInputPage}
            keyboardType="number-pad"
            placeholder="Trang"
            style={styles.gotoInput}
          />

          <TouchableOpacity onPress={goToPage} style={styles.gotoBtn}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>GO</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  // PAGINATION
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },

  pageBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: "#FF5733",
    borderRadius: 8,
  },

  pageText: {
    color: "#fff",
    fontWeight: "bold",
  },

  pageInfo: {
    fontWeight: "bold",
    color: "#333",
  },

  disabled: {
    backgroundColor: "#ccc",
  },
  paginationWrapper: {
    marginVertical: 20,
    gap: 10,
  },

  gotoBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  gotoInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: 70,
    textAlign: "center",
  },

  gotoBtn: {
    backgroundColor: "#2ECC71",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
});
