import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 12 },
  content: { paddingBottom: 92 },
  actionButton: {
    marginTop: 10,
  },
  subLabel: {
    marginTop: 12,
    marginBottom: 6,
    fontWeight: "700",
  },
  subTabsRow: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 8,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  subTabButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    marginVertical: 0,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  subTabText: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  label: {
    marginTop: 8,
    marginBottom: 6,
    fontWeight: "600",
  },
  capitalize: {
    textTransform: "capitalize",
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  btnText: {
    color: "white",
    fontWeight: "700",
  },
  card: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "rgba(130,130,130,0.15)",
  },
  inlineActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    alignItems: "center",
  },
  menuTriggerBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  iconActionsMenu: {
    flexDirection: "row",
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  iconOnlyAction: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  smallBtn: {
    minWidth: 120,
    marginTop: 8,
  },
  smallBtnInline: {
    flex: 1,
    marginTop: 0,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    maxHeight: "85%",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    padding: 14,
  },
  modalCardWide: {
    maxHeight: "92%",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    padding: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 12,
  },
  emptyHint: {
    marginTop: 12,
    opacity: 0.75,
  },
  breakRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  breakInput: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: "700",
  },
  detailLine: {
    marginBottom: 8,
  },
  modalImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "rgba(130,130,130,0.15)",
  },
  inlineOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  optionChip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "rgba(130,130,130,0.2)",
  },
  staffChip: {
    marginBottom: 6,
  },
  optionChipActive: {
    borderWidth: 0,
  },
  optionChipText: {
    color: "white",
    fontWeight: "600",
  },
  cardRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  cardThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "rgba(130,130,130,0.15)",
  },
  cardThumbPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "rgba(130,130,130,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  chip: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: "rgba(130,130,130,0.25)",
  },
  chipGroup: {
    backgroundColor: "rgba(66,133,244,0.25)",
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(130,130,130,0.15)",
  },
  avatarInitials: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(217,48,37,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0,
    alignSelf: "flex-end",
  },
});
