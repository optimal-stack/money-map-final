import { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import i18n from "../i18n";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";

const LANGS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "bn", label: "বাংলা" },
  { code: "mr", label: "मराठी" },
  { code: "gu", label: "ગુજરાતી" },
];

export default function LanguagePicker() {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <TouchableOpacity onPress={() => setOpen(true)} style={{ padding: 8 }}>
        <Ionicons name="language" size={20} color={COLORS.text} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ backgroundColor: COLORS.card, borderRadius: 12, padding: 16, width: 280 }}>
            {LANGS.map((l) => (
              <TouchableOpacity
                key={l.code}
                onPress={() => {
                  i18n.changeLanguage(l.code);
                  setOpen(false);
                }}
                style={{ paddingVertical: 10 }}
              >
                <Text style={{ color: COLORS.text, fontSize: 16 }}>{l.label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={() => setOpen(false)} style={{ alignSelf: "flex-end", marginTop: 8 }}>
              <Text style={{ color: COLORS.primary }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}


