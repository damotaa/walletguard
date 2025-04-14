import React, { useRef } from "react";
import {
  Animated,
  Image,
  Dimensions,
  PanResponder,
  StyleSheet,
} from "react-native";
import Modal from "react-native-modal";

const { width, height } = Dimensions.get("window");

interface Props {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
}

// This component displays a zoomable image modal, allow the user to zoom the recei.
export default function ZoomableImageModal({
  visible,
  imageUri,
  onClose,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      pan.setOffset({
        x: pan.x._value,
        y: pan.y._value,
      });
    },
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: () => {
      pan.flattenOffset();
    },
  });

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
    >
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.imageWrapper,
          {
            transform: [...pan.getTranslateTransform(), { scale }],
          },
        ]}
      >
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="contain"
        />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: width * 0.95,
    height: height * 0.8,
  },
});
