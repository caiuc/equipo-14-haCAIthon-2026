import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { Camera, Flashlight, Keyboard, RotateCcw } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Vibration, View } from 'react-native';

import { AppText, Button } from '@/design/components';
import { useTheme } from '@/design/theme';
import { radius, spacing } from '@/design/tokens';
import { normalizeBarcode } from '@/services/barcode/productLookup';

const BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e'] as const;

export function CameraScanner({
  locked,
  onBarcode,
  onManualFallback,
  onReset,
}: {
  locked?: boolean;
  onBarcode: (barcode: string) => void;
  onManualFallback: () => void;
  onReset?: () => void;
}) {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const lastScan = useRef<{ barcode: string; at: number } | undefined>(undefined);

  const handleBarcodeScanned = useCallback((result: BarcodeScanningResult) => {
    const barcode = normalizeBarcode(result.data);
    if (!barcode) return;
    const now = Date.now();
    if (lastScan.current?.barcode === barcode && now - lastScan.current.at < 1800) return;
    lastScan.current = { barcode, at: now };
    Vibration.vibrate(60);
    onBarcode(barcode);
  }, [onBarcode]);

  if (!permission) {
    return (
      <View style={[styles.permissionState, { backgroundColor: colors.surfaceMuted }]}>
        <ActivityIndicator color={colors.primary} />
        <AppText style={{ color: colors.textMuted }}>Preparando cámara...</AppText>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.permissionState, { backgroundColor: colors.surfaceMuted }]}>
        <View style={[styles.permissionIcon, { backgroundColor: colors.surface }]}>
          <Camera size={26} color={colors.primary} />
        </View>
        <AppText variant="h3" style={{ textAlign: 'center' }}>Activa la cámara para escanear</AppText>
        <AppText style={{ textAlign: 'center', color: colors.textMuted, maxWidth: 420 }}>
          Si prefieres no dar permiso, puedes registrar el material manualmente.
        </AppText>
        <View style={styles.permissionActions}>
          {permission.canAskAgain && <Button label="Permitir cámara" icon={Camera} onPress={requestPermission} />}
          <Button label="Ingresar manual" variant="secondary" icon={Keyboard} onPress={onManualFallback} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceStrong }]}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torchEnabled}
        onBarcodeScanned={locked ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
      />
      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <View style={[styles.statusPill, { backgroundColor: colors.scrim }]}>
            <AppText variant="caption" style={{ color: '#FFFFFF' }}>{locked ? 'Código capturado' : 'Busca el código de barras'}</AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={torchEnabled ? 'Apagar linterna' : 'Encender linterna'}
            onPress={() => setTorchEnabled((value) => !value)}
            style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.scrim, opacity: pressed ? 0.76 : 1 }]}
          >
            <Flashlight size={20} color="#FFFFFF" />
          </Pressable>
        </View>
        <View style={styles.frameWrap}>
          <View style={[styles.frame, { borderColor: locked ? colors.environmental : '#FFFFFF' }]}>
            <View style={[styles.scanLine, { backgroundColor: locked ? colors.environmental : colors.primary }]} />
          </View>
        </View>
        <View style={styles.bottomBar}>
          <Button label="Manual" variant="dark" compact icon={Keyboard} onPress={onManualFallback} />
          {locked && <Button label="Escanear otro" variant="dark" compact icon={RotateCcw} onPress={onReset} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 360,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusPill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: '82%',
    maxWidth: 430,
    aspectRatio: 1.65,
    borderWidth: 3,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanLine: {
    width: '86%',
    height: 3,
    borderRadius: radius.pill,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  permissionState: {
    minHeight: 310,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  permissionIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
});
