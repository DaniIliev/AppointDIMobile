import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { apiRequest } from "../../lib/http";
import { Colors } from "../../constants/Colors";
import {
  KanbanBoard,
  KanbanColumn,
  KanbanCard,
  KanbanUser,
  KanbanComment,
  Priority,
  CardStatus,
} from "../../Global/Types/kanban";

// ─── Helpers ───────────────────────────────────────────────────────────────
type ThemePalette = {
  bg: string;
  surface: string;
  text: string;
  mutedText: string;
  border: string;
  primary: string;
  danger: string;
};

function alpha(color: string, opacityHex: string) {
  return `${color}${opacityHex}`;
}

function getPriorityColors(theme: ThemePalette): Record<Priority, string> {
  return {
    low: theme.mutedText,
    medium: theme.primary,
    high: Colors.warning,
    urgent: theme.danger,
  };
}

function getStatusColors(theme: ThemePalette): Record<CardStatus, string> {
  return {
    Planned: theme.mutedText,
    "In Progress": theme.primary,
    Finished: Colors.primary,
  };
}

function getColumnPalette(theme: ThemePalette) {
  return [
    theme.primary,
    Colors.primary,
    theme.text,
    theme.mutedText,
    Colors.warning,
    theme.primary,
    Colors.primary,
    theme.text,
    theme.mutedText,
    Colors.warning,
  ];
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("bg-BG", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function initials(user: KanbanUser) {
  return `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
}

// ─── Sub-components ─────────────────────────────────────────────────────────

interface AvatarBubbleProps {
  user: KanbanUser;
  size?: number;
}
function AvatarBubble({ user, size = 26 }: AvatarBubbleProps) {
  return (
    <View
      style={[
        ss.avatarBubble,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[ss.avatarText, { fontSize: size * 0.38 }]}>{initials(user)}</Text>
    </View>
  );
}

interface PriorityBadgeProps {
  priority: Priority;
  theme: ThemePalette;
}
function PriorityBadge({ priority, theme }: PriorityBadgeProps) {
  const priorityColors = getPriorityColors(theme);
  return (
    <View style={[ss.badge, { backgroundColor: alpha(priorityColors[priority], "22") }]}>
      <View style={[ss.badgeDot, { backgroundColor: priorityColors[priority] }]} />
      <Text style={[ss.badgeText, { color: priorityColors[priority] }]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Text>
    </View>
  );
}

interface StatusBadgeProps {
  status: CardStatus;
  theme: ThemePalette;
}
function StatusBadge({ status, theme }: StatusBadgeProps) {
  const statusColors = getStatusColors(theme);
  return (
    <View style={[ss.badge, { backgroundColor: alpha(statusColors[status], "22") }]}>
      <Text style={[ss.badgeText, { color: statusColors[status] }]}>{status}</Text>
    </View>
  );
}

// ─── Card Item ───────────────────────────────────────────────────────────────

interface CardItemProps {
  card: KanbanCard;
  columnColor: string;
  theme: ThemePalette;
  onPress: () => void;
  onDelete: () => void;
}
function CardItem({ card, columnColor, theme, onPress, onDelete }: CardItemProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  return (
    <TouchableOpacity style={ss.cardItem} onPress={onPress} activeOpacity={0.8}>
      <View style={[ss.cardColorBar, { backgroundColor: columnColor }]} />
      <View style={ss.cardBody}>
        <View style={ss.cardHeader}>
          <Text style={ss.cardTitle} numberOfLines={2}>{card.title}</Text>
          <TouchableOpacity onPress={() => setMenuVisible(true)} hitSlop={8}>
            <Ionicons name="ellipsis-horizontal" size={16} color={theme.mutedText} />
          </TouchableOpacity>
        </View>

        {card.description ? (
          <Text style={ss.cardDesc} numberOfLines={2}>{card.description}</Text>
        ) : null}

        <View style={ss.cardMeta}>
          {card.priority && <PriorityBadge priority={card.priority} theme={theme} />}
          {card.status && <StatusBadge status={card.status} theme={theme} />}
        </View>

        {card.endDate ? (
          <View style={ss.cardDateRow}>
            <Ionicons name="calendar-outline" size={12} color={theme.mutedText} />
            <Text style={ss.cardDateText}>{formatDate(card.endDate)}</Text>
          </View>
        ) : null}

        {card.assignedUsers?.length > 0 && (
          <View style={ss.cardAvatarRow}>
            {card.assignedUsers.slice(0, 4).map((u, idx) => (
              <View key={u._id} style={[ss.avatarOverlap, { zIndex: 10 - idx, marginLeft: idx === 0 ? 0 : -8 }]}>
                <AvatarBubble user={u} size={24} />
              </View>
            ))}
            {card.assignedUsers.length > 4 && (
              <Text style={ss.moreAvatars}>+{card.assignedUsers.length - 4}</Text>
            )}
          </View>
        )}

        <View style={ss.cardFooter}>
          {card.comments?.length > 0 && (
            <View style={ss.cardFooterItem}>
              <Ionicons name="chatbubble-outline" size={12} color={theme.mutedText} />
              <Text style={ss.cardFooterText}>{card.comments.length}</Text>
            </View>
          )}
          {card.attachments?.length > 0 && (
            <View style={ss.cardFooterItem}>
              <Ionicons name="attach-outline" size={12} color={theme.mutedText} />
              <Text style={ss.cardFooterText}>{card.attachments.length}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Card context menu */}
      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={ss.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View style={ss.menuPopup}>
            <TouchableOpacity style={ss.menuItem} onPress={() => { setMenuVisible(false); onPress(); }}>
              <Ionicons name="pencil-outline" size={16} color={theme.text} />
              <Text style={ss.menuItemText}>Редактирай</Text>
            </TouchableOpacity>
            <View style={ss.menuDivider} />
            <TouchableOpacity style={ss.menuItem} onPress={() => { setMenuVisible(false); onDelete(); }}>
              <Ionicons name="trash-outline" size={16} color={theme.danger} />
              <Text style={[ss.menuItemText, { color: theme.danger }]}>Изтрий</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </TouchableOpacity>
  );
}

// ─── Column Component ─────────────────────────────────────────────────────

interface ColumnProps {
  column: KanbanColumn;
  theme: ThemePalette;
  primaryColor: string;
  onAddCard: () => void;
  onEditColumn: () => void;
  onDeleteColumn: () => void;
  onEditCard: (card: KanbanCard) => void;
  onDeleteCard: (cardId: string) => void;
}
function ColumnView({ column, theme, primaryColor, onAddCard, onEditColumn, onDeleteColumn, onEditCard, onDeleteCard }: ColumnProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const isOverLimit = column.limit != null && column.cards.length >= column.limit;

  return (
    <View
      style={[
        ss.column,
        {
          width: Dimensions.get("window").width * 0.78,
          backgroundColor: theme.surface,
        },
      ]}
    >
      {/* Column header */}
      <View style={[ss.columnHeader, { borderLeftColor: column.color, borderBottomColor: theme.border }]}> 
        <View style={ss.columnHeaderLeft}>
          <View style={[ss.columnColorDot, { backgroundColor: column.color }]} />
          <Text style={[ss.columnTitle, { color: theme.text }]} numberOfLines={1}>{column.title}</Text>
          <View style={[ss.columnCount, { backgroundColor: theme.bg }]}> 
            <Text style={[ss.columnCountText, isOverLimit && { color: theme.danger }]}>
              {column.cards.length}{column.limit != null ? `/${column.limit}` : ""}
            </Text>
          </View>
        </View>
        <View style={ss.columnHeaderRight}>
          <TouchableOpacity onPress={() => setMenuVisible(true)} hitSlop={8} style={ss.columnMenuBtn}>
            <Ionicons name="ellipsis-vertical" size={16} color={theme.mutedText} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Cards */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
        <TouchableOpacity
          onPress={onAddCard}
          disabled={isOverLimit}
          style={[
            ss.columnTopAddBtn,
            {
              borderColor: isOverLimit ? theme.border : primaryColor,
              backgroundColor: alpha(primaryColor, "14"),
            },
          ]}
        >
          <Ionicons name="add" size={16} color={isOverLimit ? theme.mutedText : primaryColor} />
          <Text style={[ss.columnTopAddText, { color: isOverLimit ? theme.mutedText : primaryColor }]}>Add</Text>
        </TouchableOpacity>

        {column.cards.length === 0 ? (
          <View style={ss.emptyColumnHint}>
            <Text style={[ss.emptyColumnText, { color: theme.mutedText }]}>Няма карти</Text>
          </View>
        ) : (
          column.cards.map((card) => (
            <CardItem
              key={card._id}
              card={card}
              theme={theme}
              columnColor={column.color}
              onPress={() => onEditCard(card)}
              onDelete={() => onDeleteCard(card._id)}
            />
          ))
        )}
      </ScrollView>

      {/* Column menu */}
      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={ss.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View style={ss.menuPopup}>
            <TouchableOpacity style={ss.menuItem} onPress={() => { setMenuVisible(false); onEditColumn(); }}>
              <Ionicons name="pencil-outline" size={16} color={theme.text} />
              <Text style={ss.menuItemText}>Редактирай колона</Text>
            </TouchableOpacity>
            <View style={ss.menuDivider} />
            <TouchableOpacity style={ss.menuItem} onPress={() => { setMenuVisible(false); onDeleteColumn(); }}>
              <Ionicons name="trash-outline" size={16} color={theme.danger} />
              <Text style={[ss.menuItemText, { color: theme.danger }]}>Изтрий колона</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Board Selector ───────────────────────────────────────────────────────────

interface BoardSelectorProps {
  boards: KanbanBoard[];
  selectedId: string | null;
  theme: ThemePalette;
  primaryColor: string;
  onSelect: (id: string) => void;
  onCreateBoard: () => void;
  onEditBoard: () => void;
  onDeleteBoard: () => void;
}
function BoardSelector({ boards, selectedId, theme, primaryColor, onSelect, onCreateBoard, onEditBoard, onDeleteBoard }: BoardSelectorProps) {
  const [open, setOpen] = useState(false);
  const selected = boards.find((b) => b._id === selectedId);

  return (
    <View style={ss.boardSelectorRow}>
      <TouchableOpacity style={[ss.boardSelectorBtn, { borderColor: primaryColor }]} onPress={() => setOpen(true)}>
        <Ionicons name="layers-outline" size={16} color={primaryColor} />
        <Text style={[ss.boardSelectorText, { color: primaryColor }]} numberOfLines={1}>
          {selected ? selected.title : "Избери борд"}
        </Text>
        <Ionicons name="chevron-down" size={14} color={primaryColor} />
      </TouchableOpacity>

      <TouchableOpacity style={[ss.boardIconBtn, { backgroundColor: primaryColor + "18" }]} onPress={onCreateBoard}>
        <Ionicons name="add" size={20} color={primaryColor} />
      </TouchableOpacity>

      {selectedId && (
        <>
          <TouchableOpacity style={ss.boardIconBtn} onPress={onEditBoard}>
            <Ionicons name="pencil-outline" size={18} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={ss.boardIconBtn} onPress={onDeleteBoard}>
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
          </TouchableOpacity>
        </>
      )}

      {/* Dropdown */}
      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={ss.menuOverlay} onPress={() => setOpen(false)}>
          <View style={[ss.boardDropdown]}>
            <Text style={ss.boardDropdownTitle}>Бордове</Text>
            {boards.map((b) => (
              <TouchableOpacity
                key={b._id}
                style={[ss.boardDropdownItem, b._id === selectedId && { backgroundColor: primaryColor + "18" }]}
                onPress={() => { setOpen(false); onSelect(b._id); }}
              >
                <Ionicons name="layers-outline" size={15} color={b._id === selectedId ? primaryColor : theme.text} />
                <Text style={[ss.boardDropdownItemText, b._id === selectedId && { color: primaryColor, fontWeight: "600" }]}>
                  {b.title}
                </Text>
                {b._id === selectedId && <Ionicons name="checkmark" size={15} color={primaryColor} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Column Modal ─────────────────────────────────────────────────────────────

interface ColumnModalProps {
  visible: boolean;
  mode: "create" | "edit";
  column: KanbanColumn | null;
  theme: ThemePalette;
  primaryColor: string;
  onClose: () => void;
  onSave: (data: { title: string; color: string; limit?: number }, mode: "create" | "edit") => void;
}
function ColumnModalView({ visible, mode, column, theme, primaryColor, onClose, onSave }: ColumnModalProps) {
  const columnPalette = getColumnPalette(theme);
  const [title, setTitle] = useState("");
  const [color, setColor] = useState(columnPalette[0]);
  const [limit, setLimit] = useState("");

  useEffect(() => {
    if (visible) {
      setTitle(column?.title ?? "");
      setColor(column?.color ?? columnPalette[0]);
      setLimit(column?.limit != null ? String(column.limit) : "");
    }
  }, [visible, column, columnPalette]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <Pressable style={ss.bottomSheetOverlay} onPress={onClose}>
          <Pressable style={ss.bottomSheet} onPress={(e) => e.stopPropagation()}>
            <View style={ss.sheetHandle} />
            <Text style={ss.sheetTitle}>{mode === "create" ? "Нова колона" : "Редактирай колона"}</Text>

            <Text style={ss.fieldLabel}>Заглавие</Text>
            <TextInput
              style={ss.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Въведи заглавие"
              placeholderTextColor={theme.mutedText}
            />

            <Text style={ss.fieldLabel}>Цвят</Text>
            <View style={ss.colorPalette}>
              {columnPalette.map((c: string) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  style={[ss.colorDot, { backgroundColor: c }, color === c && ss.colorDotSelected]}
                />
              ))}
            </View>

            <Text style={ss.fieldLabel}>Лимит на карти (незадължително)</Text>
            <TextInput
              style={ss.input}
              value={limit}
              onChangeText={setLimit}
              placeholder="Без лимит"
              placeholderTextColor={theme.mutedText}
              keyboardType="number-pad"
            />

            <View style={ss.sheetBtnRow}>
              <TouchableOpacity style={ss.sheetBtnCancel} onPress={onClose}>
                <Text style={ss.sheetBtnCancelText}>Откажи</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[ss.sheetBtnSave, { backgroundColor: primaryColor }, !title.trim() && { opacity: 0.5 }]}
                onPress={() => { if (title.trim()) { onSave({ title, color, limit: limit ? Number(limit) : undefined }, mode); onClose(); } }}
                disabled={!title.trim()}
              >
                <Text style={ss.sheetBtnSaveText}>Запази</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Board Modal ─────────────────────────────────────────────────────────────

interface BoardModalProps {
  visible: boolean;
  mode: "create" | "edit";
  title: string;
  theme: ThemePalette;
  primaryColor: string;
  onClose: () => void;
  onChange: (t: string) => void;
  onSave: () => void;
}
function BoardModalView({ visible, mode, title, theme, primaryColor, onClose, onChange, onSave }: BoardModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <Pressable style={ss.bottomSheetOverlay} onPress={onClose}>
          <Pressable style={ss.bottomSheet} onPress={(e) => e.stopPropagation()}>
            <View style={ss.sheetHandle} />
            <Text style={ss.sheetTitle}>{mode === "create" ? "Нов борд" : "Преименувай борд"}</Text>

            <Text style={ss.fieldLabel}>Заглавие</Text>
            <TextInput
              style={ss.input}
              value={title}
              onChangeText={onChange}
              placeholder="Въведи заглавие"
              placeholderTextColor={theme.mutedText}
              autoFocus
            />

            <View style={ss.sheetBtnRow}>
              <TouchableOpacity style={ss.sheetBtnCancel} onPress={onClose}>
                <Text style={ss.sheetBtnCancelText}>Откажи</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[ss.sheetBtnSave, { backgroundColor: primaryColor }, !title.trim() && { opacity: 0.5 }]}
                onPress={() => { if (title.trim()) { onSave(); } }}
                disabled={!title.trim()}
              >
                <Text style={ss.sheetBtnSaveText}>Запази</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Card Detail Modal ────────────────────────────────────────────────────────

interface CardModalProps {
  visible: boolean;
  mode: "create" | "edit";
  card: KanbanCard | null;
  columnId?: string;
  columns: KanbanColumn[];
  availableUsers: KanbanUser[];
  theme: ThemePalette;
  primaryColor: string;
  token: string;
  onClose: () => void;
  onSave: (data: Partial<KanbanCard>, mode: "create" | "edit") => void;
  onDelete?: (cardId: string) => void;
  onAddComment?: (cardId: string, text: string) => void;
  onDeleteComment?: (cardId: string, commentId: string) => void;
}

function CardModalView({
  visible, mode, card, columnId, columns, availableUsers, theme, primaryColor, token,
  onClose, onSave, onDelete, onAddComment, onDeleteComment,
}: CardModalProps) {
  const priorityColors = getPriorityColors(theme);
  const statusColors = getStatusColors(theme);
  const [tab, setTab] = useState<"details" | "comments">("details");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<CardStatus>("Planned");
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [assignedUsers, setAssignedUsers] = useState<KanbanUser[]>([]);
  const [commentText, setCommentText] = useState("");
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [showUserPicker, setShowUserPicker] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setTab("details");
    setTitle(card?.title ?? "");
    setDescription(card?.description ?? "");
    setStartDate(card?.startDate ?? "");
    setEndDate(card?.endDate ?? "");
    setPriority(card?.priority ?? "medium");
    setStatus(card?.status ?? "Planned");
    setSelectedColumn(card?.columnId ?? columnId ?? "");
    setAssignedUsers(card?.assignedUsers ?? []);
    setCommentText("");
    setShowPriorityPicker(false);
    setShowStatusPicker(false);
    setShowColumnPicker(false);
    setShowUserPicker(false);
  }, [visible, card, columnId]);

  const toggleUser = (user: KanbanUser) => {
    setAssignedUsers((prev) =>
      prev.some((u) => u._id === user._id) ? prev.filter((u) => u._id !== user._id) : [...prev, user]
    );
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(
      {
        ...(card ?? {}),
        title,
        description,
        startDate,
        endDate,
        priority,
        status,
        columnId: selectedColumn,
        assignedUsers,
      },
      mode
    );
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={ss.cardModalOverlay}>
          <View style={ss.cardModalSheet}>
            <View style={ss.sheetHandle} />
            {/* Tabs */}
            <View style={ss.cardModalTabs}>
              <TouchableOpacity
                style={[ss.cardModalTab, tab === "details" && { borderBottomColor: primaryColor, borderBottomWidth: 2 }]}
                onPress={() => setTab("details")}
              >
                <Text style={[ss.cardModalTabText, tab === "details" && { color: primaryColor }]}>Детайли</Text>
              </TouchableOpacity>
              {mode === "edit" && (
                <TouchableOpacity
                  style={[ss.cardModalTab, tab === "comments" && { borderBottomColor: primaryColor, borderBottomWidth: 2 }]}
                  onPress={() => setTab("comments")}
                >
                  <Text style={[ss.cardModalTabText, tab === "comments" && { color: primaryColor }]}>
                    Коментари {card?.comments?.length ? `(${card.comments.length})` : ""}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              {tab === "details" ? (
                <View style={{ paddingHorizontal: 16 }}>
                  <Text style={ss.fieldLabel}>Заглавие *</Text>
                  <TextInput
                    style={ss.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Въведи заглавие"
                    placeholderTextColor={theme.mutedText}
                  />

                  <Text style={ss.fieldLabel}>Описание</Text>
                  <TextInput
                    style={[ss.input, { height: 80, textAlignVertical: "top" }]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Описание (незадължително)"
                    placeholderTextColor={theme.mutedText}
                    multiline
                  />

                  {/* Priority */}
                  <Text style={ss.fieldLabel}>Приоритет</Text>
                  <TouchableOpacity style={ss.pickerBtn} onPress={() => setShowPriorityPicker(true)}>
                    <View style={[ss.badgeDot, { backgroundColor: priorityColors[priority] }]} />
                    <Text style={ss.pickerBtnText}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color={theme.mutedText} />
                  </TouchableOpacity>

                  {/* Status */}
                  <Text style={ss.fieldLabel}>Статус</Text>
                  <TouchableOpacity style={ss.pickerBtn} onPress={() => setShowStatusPicker(true)}>
                    <View style={[ss.badgeDot, { backgroundColor: statusColors[status] }]} />
                    <Text style={ss.pickerBtnText}>{status}</Text>
                    <Ionicons name="chevron-down" size={14} color={theme.mutedText} />
                  </TouchableOpacity>

                  {/* Column */}
                  {columns.length > 0 && (
                    <>
                      <Text style={ss.fieldLabel}>Колона</Text>
                      <TouchableOpacity style={ss.pickerBtn} onPress={() => setShowColumnPicker(true)}>
                        <Text style={ss.pickerBtnText}>
                          {columns.find((c) => c._id === selectedColumn)?.title ?? "Избери колона"}
                        </Text>
                        <Ionicons name="chevron-down" size={14} color={theme.mutedText} />
                      </TouchableOpacity>
                    </>
                  )}

                  {/* Dates */}
                  <View style={ss.dateRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={ss.fieldLabel}>Начална дата</Text>
                      <TextInput
                        style={ss.input}
                        value={startDate}
                        onChangeText={setStartDate}
                        placeholder="ГГГГ-ММ-ДД"
                        placeholderTextColor={theme.mutedText}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={ss.fieldLabel}>Крайна дата</Text>
                      <TextInput
                        style={ss.input}
                        value={endDate}
                        onChangeText={setEndDate}
                        placeholder="ГГГГ-ММ-ДД"
                        placeholderTextColor={theme.mutedText}
                      />
                    </View>
                  </View>

                  {/* Assignees */}
                  <Text style={ss.fieldLabel}>Назначени</Text>
                  <TouchableOpacity style={ss.pickerBtn} onPress={() => setShowUserPicker(true)}>
                    {assignedUsers.length === 0 ? (
                      <Text style={ss.pickerBtnText}>Назначи потребители</Text>
                    ) : (
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, flex: 1 }}>
                        {assignedUsers.map((u) => (
                          <View key={u._id} style={[ss.userChip, { backgroundColor: primaryColor + "22" }]}>
                            <Text style={[ss.userChipText, { color: primaryColor }]}>
                              {u.firstName} {u.lastName}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                    <Ionicons name="chevron-down" size={14} color={theme.mutedText} />
                  </TouchableOpacity>

                  {/* Actions */}
                  <View style={[ss.sheetBtnRow, { marginTop: 24 }]}>
                    {mode === "edit" && onDelete && card && (
                      <TouchableOpacity
                        style={ss.deleteBtn}
                        onPress={() => { onDelete(card._id); onClose(); }}
                      >
                        <Ionicons name="trash-outline" size={16} color={theme.danger} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={ss.sheetBtnCancel} onPress={onClose}>
                      <Text style={ss.sheetBtnCancelText}>Откажи</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[ss.sheetBtnSave, { backgroundColor: primaryColor }, !title.trim() && { opacity: 0.5 }]}
                      onPress={handleSave}
                      disabled={!title.trim()}
                    >
                      <Text style={ss.sheetBtnSaveText}>Запази</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* Comments tab */
                <View style={{ paddingHorizontal: 16 }}>
                  {card?.comments?.length === 0 && (
                    <Text style={ss.emptyColumnText}>Няма коментари</Text>
                  )}
                  {card?.comments?.map((c) => (
                    <View key={c._id} style={ss.commentItem}>
                      <AvatarBubble user={c.user ?? { _id: c.userId, firstName: "?", lastName: "", email: "" }} size={30} />
                      <View style={ss.commentBody}>
                        <Text style={ss.commentAuthor}>
                          {c.user ? `${c.user.firstName} ${c.user.lastName}` : "Потребител"}
                        </Text>
                        <Text style={ss.commentText}>{c.text}</Text>
                        <Text style={ss.commentDate}>{formatDate(c.createdAt)}</Text>
                      </View>
                      {onDeleteComment && card && (
                        <TouchableOpacity onPress={() => onDeleteComment(card._id, c._id)} hitSlop={8}>
                          <Ionicons name="trash-outline" size={14} color={theme.danger} />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}

                  <View style={ss.commentInputRow}>
                    <TextInput
                      style={[ss.input, { flex: 1, marginBottom: 0 }]}
                      value={commentText}
                      onChangeText={setCommentText}
                      placeholder="Добави коментар..."
                      placeholderTextColor={theme.mutedText}
                    />
                    <TouchableOpacity
                      style={[ss.commentSendBtn, { backgroundColor: primaryColor }, !commentText.trim() && { opacity: 0.5 }]}
                      disabled={!commentText.trim()}
                      onPress={() => {
                        if (card && commentText.trim() && onAddComment) {
                          onAddComment(card._id, commentText.trim());
                          setCommentText("");
                        }
                      }}
                    >
                      <Ionicons name="send" size={16} color={theme.bg} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Priority picker */}
      <Modal transparent visible={showPriorityPicker} animationType="fade" onRequestClose={() => setShowPriorityPicker(false)}>
        <Pressable style={ss.menuOverlay} onPress={() => setShowPriorityPicker(false)}>
          <View style={ss.menuPopup}>
            {(["low", "medium", "high", "urgent"] as Priority[]).map((p) => (
              <TouchableOpacity key={p} style={ss.menuItem} onPress={() => { setPriority(p); setShowPriorityPicker(false); }}>
                <View style={[ss.badgeDot, { backgroundColor: priorityColors[p] }]} />
                <Text style={ss.menuItemText}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
                {priority === p && <Ionicons name="checkmark" size={15} color={priorityColors[p]} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Status picker */}
      <Modal transparent visible={showStatusPicker} animationType="fade" onRequestClose={() => setShowStatusPicker(false)}>
        <Pressable style={ss.menuOverlay} onPress={() => setShowStatusPicker(false)}>
          <View style={ss.menuPopup}>
            {(["Planned", "In Progress", "Finished"] as CardStatus[]).map((s) => (
              <TouchableOpacity key={s} style={ss.menuItem} onPress={() => { setStatus(s); setShowStatusPicker(false); }}>
                <View style={[ss.badgeDot, { backgroundColor: statusColors[s] }]} />
                <Text style={ss.menuItemText}>{s}</Text>
                {status === s && <Ionicons name="checkmark" size={15} color={statusColors[s]} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Column picker */}
      <Modal transparent visible={showColumnPicker} animationType="fade" onRequestClose={() => setShowColumnPicker(false)}>
        <Pressable style={ss.menuOverlay} onPress={() => setShowColumnPicker(false)}>
          <View style={ss.menuPopup}>
            {columns.map((col) => (
              <TouchableOpacity key={col._id} style={ss.menuItem} onPress={() => { setSelectedColumn(col._id); setShowColumnPicker(false); }}>
                <View style={[ss.badgeDot, { backgroundColor: col.color }]} />
                <Text style={ss.menuItemText}>{col.title}</Text>
                {selectedColumn === col._id && <Ionicons name="checkmark" size={15} color={col.color} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* User picker */}
      <Modal transparent visible={showUserPicker} animationType="fade" onRequestClose={() => setShowUserPicker(false)}>
        <Pressable style={ss.menuOverlay} onPress={() => setShowUserPicker(false)}>
          <View style={[ss.menuPopup, { minWidth: 260 }]}>
            <Text style={ss.boardDropdownTitle}>Назначи потребители</Text>
            {availableUsers.map((u) => {
              const isSelected = assignedUsers.some((a) => a._id === u._id);
              return (
                <TouchableOpacity key={u._id} style={ss.menuItem} onPress={() => toggleUser(u)}>
                  <AvatarBubble user={u} size={28} />
                  <Text style={ss.menuItemText}>{u.firstName} {u.lastName}</Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={[ss.sheetBtnSave, { backgroundColor: primaryColor, marginTop: 8, alignItems: "center" }]} onPress={() => setShowUserPicker(false)}>
              <Text style={ss.sheetBtnSaveText}>Готово</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function KanbanScreen() {
  const systemScheme = useColorScheme();
  const { session, primaryColor, themePreference } = useAuth();
  const token = session?.token ?? "";
  const businessId = session?.user?.businessId ?? "";
  const resolvedScheme: "light" | "dark" =
    themePreference ?? (systemScheme === "dark" ? "dark" : "light");
  const baseTheme = Colors[resolvedScheme];
  const theme: ThemePalette = {
    bg: baseTheme.background,
    surface: baseTheme.navBackground,
    text: baseTheme.title,
    mutedText: baseTheme.iconColor,
    border: baseTheme.uiBackground,
    primary: primaryColor ?? Colors.primary,
    danger: Colors.warning,
  };
  const pc = theme.primary;

  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [availableUsers, setAvailableUsers] = useState<KanbanUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Board modal
  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [boardModalMode, setBoardModalMode] = useState<"create" | "edit">("create");
  const [boardTitle, setBoardTitle] = useState("");

  // Column modal
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [columnModalMode, setColumnModalMode] = useState<"create" | "edit">("create");
  const [selectedColumn, setSelectedColumn] = useState<KanbanColumn | null>(null);

  // Card modal
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [cardModalMode, setCardModalMode] = useState<"create" | "edit">("create");
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | undefined>(undefined);

  // ── Load ─────────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    if (!businessId) { setLoading(false); return; }
    setLoading(true);
    try {
      const boardsData = await apiRequest<KanbanBoard[]>(
        `/api/kanban/boards?businessId=${businessId}`,
        { token }
      );
      if (boardsData?.length > 0) {
        setBoards(boardsData);
        const first = boardsData[0];
        setSelectedBoardId(first._id);
        const full = await apiRequest<KanbanBoard>(`/api/kanban/boards/${first._id}`, { token });
        setColumns(full.columns ?? []);
      } else {
        setBoards([]);
        setSelectedBoardId(null);
        setColumns([]);
      }
      const members = await apiRequest<KanbanUser[]>(`/api/kanban/business/${businessId}/members`, { token });
      setAvailableUsers(members ?? []);
    } catch (e) {
      console.error("Kanban load error", e);
      Alert.alert("Грешка", "Неуспешно зареждане на канбан данни");
    } finally {
      setLoading(false);
    }
  }, [businessId, token]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSelectBoard = async (id: string) => {
    setSelectedBoardId(id);
    setLoading(true);
    try {
      const full = await apiRequest<KanbanBoard>(`/api/kanban/boards/${id}`, { token });
      setColumns(full.columns ?? []);
    } catch {
      Alert.alert("Грешка", "Неуспешно зареждане на борд");
    } finally {
      setLoading(false);
    }
  };

  // ── Board actions ─────────────────────────────────────────────────────────

  const handleSaveBoard = async () => {
    if (!boardTitle.trim()) return;
    try {
      if (boardModalMode === "create") {
        const nb = await apiRequest<KanbanBoard>("/api/kanban/boards", {
          token, method: "POST",
          body: { title: boardTitle, description: "", businessId },
        });
        setBoards((prev) => [...prev, nb]);
        handleSelectBoard(nb._id);
      } else {
        const ub = await apiRequest<KanbanBoard>(`/api/kanban/boards/${selectedBoardId}`, {
          token, method: "PUT",
          body: { title: boardTitle },
        });
        setBoards((prev) => prev.map((b) => b._id === ub._id ? { ...b, title: ub.title } : b));
      }
      setBoardModalOpen(false);
    } catch {
      Alert.alert("Грешка", "Неуспешно запазване на борд");
    }
  };

  const handleDeleteBoard = () => {
    if (!selectedBoardId) return;
    Alert.alert("Изтриване", "Сигурни ли сте, че искате да изтриете борда?", [
      { text: "Откажи", style: "cancel" },
      {
        text: "Изтрий", style: "destructive", onPress: async () => {
          try {
            await apiRequest(`/api/kanban/boards/${selectedBoardId}`, { token, method: "DELETE" });
            const nb = boards.filter((b) => b._id !== selectedBoardId);
            setBoards(nb);
            if (nb.length > 0) { handleSelectBoard(nb[0]._id); }
            else { setSelectedBoardId(null); setColumns([]); }
          } catch {
            Alert.alert("Грешка", "Неуспешно изтриване");
          }
        },
      },
    ]);
  };

  // ── Column actions ────────────────────────────────────────────────────────

  const handleSaveColumn = async (data: { title: string; color: string; limit?: number }, mode: "create" | "edit") => {
    try {
      if (mode === "create") {
        if (!selectedBoardId) return;
        const nc = await apiRequest<KanbanColumn>("/api/kanban/columns", {
          token, method: "POST",
          body: { title: data.title, color: data.color, limit: data.limit ?? null, boardId: selectedBoardId },
        });
        setColumns((prev) => [...prev, { ...nc, cards: [] }]);
      } else if (selectedColumn) {
        const uc = await apiRequest<KanbanColumn>(`/api/kanban/columns/${selectedColumn._id}`, {
          token, method: "PUT",
          body: { title: data.title, color: data.color, limit: data.limit ?? null },
        });
        setColumns((prev) => prev.map((col) => col._id === uc._id ? { ...col, ...uc } : col));
      }
    } catch {
      Alert.alert("Грешка", "Неуспешно запазване на колона");
    }
  };

  const handleDeleteColumn = (columnId: string) => {
    Alert.alert("Изтриване", "Сигурни ли сте, че искате да изтриете колоната?", [
      { text: "Откажи", style: "cancel" },
      {
        text: "Изтрий", style: "destructive", onPress: async () => {
          try {
            await apiRequest(`/api/kanban/columns/${columnId}`, { token, method: "DELETE" });
            setColumns((prev) => prev.filter((c) => c._id !== columnId));
          } catch {
            Alert.alert("Грешка", "Неуспешно изтриване на колона");
          }
        },
      },
    ]);
  };

  // ── Card actions ──────────────────────────────────────────────────────────

  const handleSaveCard = async (data: Partial<KanbanCard>, mode: "create" | "edit") => {
    try {
      const payload = {
        ...data,
        assignedUsers: data.assignedUsers?.map((u: KanbanUser) => u._id) ?? [],
      };
      if (mode === "create") {
        const nc = await apiRequest<KanbanCard>("/api/kanban/cards", {
          token, method: "POST", body: payload,
        });
        setColumns((prev) =>
          prev.map((col) => col._id === nc.columnId ? { ...col, cards: [...col.cards, nc] } : col)
        );
      } else {
        const uc = await apiRequest<KanbanCard>(`/api/kanban/cards/${data._id}`, {
          token, method: "PUT", body: payload,
        });
        setColumns((prev) =>
          prev.map((col) => ({
            ...col,
            cards: col.cards.map((c) => c._id === uc._id ? uc : c),
          }))
        );
      }
    } catch {
      Alert.alert("Грешка", "Неуспешно запазване на карта");
    }
  };

  const handleDeleteCard = (cardId: string) => {
    Alert.alert("Изтриване", "Сигурни ли сте?", [
      { text: "Откажи", style: "cancel" },
      {
        text: "Изтрий", style: "destructive", onPress: async () => {
          try {
            await apiRequest(`/api/kanban/cards/${cardId}`, { token, method: "DELETE" });
            setColumns((prev) =>
              prev.map((col) => ({ ...col, cards: col.cards.filter((c) => c._id !== cardId) }))
            );
          } catch {
            Alert.alert("Грешка", "Неуспешно изтриване на карта");
          }
        },
      },
    ]);
  };

  // ── Comment actions ────────────────────────────────────────────────────────

  const handleAddComment = async (cardId: string, text: string) => {
    try {
      const updatedCard = await apiRequest<KanbanCard>(`/api/kanban/cards/${cardId}/comments`, {
        token, method: "POST", body: { text },
      });
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.map((c) => c._id === cardId ? updatedCard : c),
        }))
      );
      // Sync the selectedCard so comments tab refreshes
      setSelectedCard(updatedCard);
    } catch {
      Alert.alert("Грешка", "Неуспешно добавяне на коментар");
    }
  };

  const handleDeleteComment = async (cardId: string, commentId: string) => {
    try {
      const updatedCard = await apiRequest<KanbanCard>(`/api/kanban/cards/${cardId}/comments/${commentId}`, {
        token, method: "DELETE",
      });
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards: col.cards.map((c) => c._id === cardId ? updatedCard : c),
        }))
      );
      setSelectedCard(updatedCard);
    } catch {
      Alert.alert("Грешка", "Неуспешно изтриване на коментар");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={ss.centered}>
        <ActivityIndicator size="large" color={pc} />
      </View>
    );
  }

  return (
    <View style={[ss.container, { backgroundColor: theme.bg }]}> 
      {/* Board toolbar */}
      <View style={[ss.toolbar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}> 
        <BoardSelector
          boards={boards}
          selectedId={selectedBoardId}
          theme={theme}
          primaryColor={pc}
          onSelect={handleSelectBoard}
          onCreateBoard={() => { setBoardModalMode("create"); setBoardTitle(""); setBoardModalOpen(true); }}
          onEditBoard={() => {
            const b = boards.find((bd) => bd._id === selectedBoardId);
            if (b) { setBoardModalMode("edit"); setBoardTitle(b.title); setBoardModalOpen(true); }
          }}
          onDeleteBoard={handleDeleteBoard}
        />
      </View>

      {/* Empty state */}
      {boards.length === 0 ? (
        <View style={ss.centered}>
          <Ionicons name="albums-outline" size={56} color={pc + "66"} />
          <Text style={ss.emptyTitle}>Няма бордове</Text>
          <Text style={ss.emptySubtitle}>Създай първия си канбан борд</Text>
          <TouchableOpacity
            style={[ss.emptyBtn, { backgroundColor: pc }]}
            onPress={() => { setBoardModalMode("create"); setBoardTitle(""); setBoardModalOpen(true); }}
          >
            <Ionicons name="add" size={18} color={theme.bg} />
            <Text style={[ss.emptyBtnText, { color: theme.bg }]}>Създай борд</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Add column */}
          <TouchableOpacity
            style={[ss.addColumnBtn, { borderColor: pc }]}
            onPress={() => { setColumnModalMode("create"); setSelectedColumn(null); setColumnModalOpen(true); }}
          >
            <Ionicons name="add" size={16} color={pc} />
            <Text style={[ss.addColumnBtnText, { color: pc }]}>Добави колона</Text>
          </TouchableOpacity>

          {/* Columns horizontal scroll */}
          {columns.length === 0 ? (
            <View style={ss.centered}>
              <Ionicons name="list-outline" size={44} color={theme.border} />
              <Text style={ss.emptyTitle}>Няма колони</Text>
              <Text style={ss.emptySubtitle}>Добави колона, за да започнеш</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={ss.columnsContainer}
            >
              {columns.map((col) => (
                <ColumnView
                  key={col._id}
                  column={col}
                  theme={theme}
                  primaryColor={pc}
                  onAddCard={() => {
                    setCardModalMode("create");
                    setSelectedCard(null);
                    setSelectedColumnId(col._id);
                    setCardModalOpen(true);
                  }}
                  onEditColumn={() => {
                    setColumnModalMode("edit");
                    setSelectedColumn(col);
                    setColumnModalOpen(true);
                  }}
                  onDeleteColumn={() => handleDeleteColumn(col._id)}
                  onEditCard={(card) => {
                    setCardModalMode("edit");
                    setSelectedCard(card);
                    setSelectedColumnId(undefined);
                    setCardModalOpen(true);
                  }}
                  onDeleteCard={handleDeleteCard}
                />
              ))}
            </ScrollView>
          )}
        </>
      )}

      {/* Modals */}
      <BoardModalView
        visible={boardModalOpen}
        mode={boardModalMode}
        title={boardTitle}
        theme={theme}
        primaryColor={pc}
        onClose={() => setBoardModalOpen(false)}
        onChange={setBoardTitle}
        onSave={handleSaveBoard}
      />

      <ColumnModalView
        visible={columnModalOpen}
        mode={columnModalMode}
        column={selectedColumn}
        theme={theme}
        primaryColor={pc}
        onClose={() => setColumnModalOpen(false)}
        onSave={handleSaveColumn}
      />

      <CardModalView
        visible={cardModalOpen}
        mode={cardModalMode}
        card={selectedCard}
        columnId={selectedColumnId}
        columns={columns}
        availableUsers={availableUsers}
        theme={theme}
        primaryColor={pc}
        token={token}
        onClose={() => setCardModalOpen(false)}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const ss = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  toolbar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  boardSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  boardSelectorBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  boardSelectorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  boardIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  boardDropdown: {
    borderRadius: 14,
    padding: 12,
    minWidth: 220,
    maxWidth: 300,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  boardDropdownTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  boardDropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 2,
  },
  boardDropdownItemText: {
    flex: 1,
    fontSize: 14,
  },
  addColumnBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderWidth: 1.5,
    borderRadius: 8,
    borderStyle: "dashed",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addColumnBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  columnsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  column: {
    borderRadius: 16,
    marginRight: 4,
    maxHeight: Dimensions.get("window").height * 0.68,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  columnHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderLeftWidth: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  columnHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  columnHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  columnColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  columnCount: {
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  columnCountText: {
    fontSize: 11,
    fontWeight: "600",
  },
  columnAddBtn: {
    minHeight: 28,
    borderRadius: 8,
    paddingHorizontal: 8,
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
    justifyContent: "center",
  },
  columnAddText: {
    fontSize: 12,
    fontWeight: "700",
  },
  columnTopAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginHorizontal: 10,
    marginTop: 10,
    paddingVertical: 8,
    borderWidth: 1.2,
    borderRadius: 9,
    borderStyle: "dashed",
  },
  columnTopAddText: {
    fontSize: 12,
    fontWeight: "700",
  },
  columnMenuBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyColumnHint: {
    alignItems: "center",
    padding: 20,
  },
  emptyColumnText: {
    fontSize: 13,
    fontStyle: "italic",
  },
  cardItem: {
    flexDirection: "row",
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 12,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  cardColorBar: {
    width: 3,
  },
  cardBody: {
    flex: 1,
    padding: 10,
    gap: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  cardMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  cardDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardDateText: {
    fontSize: 11,
  },
  cardAvatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarOverlap: {
    borderWidth: 1.5,
    borderRadius: 999,
  },
  moreAvatars: {
    fontSize: 10,
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: "row",
    gap: 10,
  },
  cardFooterItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  cardFooterText: {
    fontSize: 11,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  avatarBubble: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontWeight: "700",
  },
  menuOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  menuPopup: {
    borderRadius: 14,
    padding: 8,
    minWidth: 200,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 8,
  },
  menuItemText: {
    fontSize: 14,
    flex: 1,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
  bottomSheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
    maxHeight: "85%",
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 4,
  },
  colorPalette: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 4,
  },
  colorDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  colorDotSelected: {
    borderWidth: 3,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sheetBtnRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  sheetBtnCancel: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  sheetBtnCancelText: {
    fontSize: 14,
    fontWeight: "600",
  },
  sheetBtnSave: {
    flex: 2,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  sheetBtnSaveText: {
    fontSize: 14,
    fontWeight: "700",
  },
  cardModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  cardModalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
    paddingTop: 16,
    paddingBottom: 36,
  },
  cardModalTabs: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  cardModalTab: {
    paddingHorizontal: 8,
    paddingBottom: 12,
    marginRight: 24,
  },
  cardModalTabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 4,
  },
  pickerBtnText: {
    flex: 1,
    fontSize: 14,
  },
  dateRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  userChip: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  userChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  deleteBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  commentItem: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: "flex-start",
  },
  commentBody: {
    flex: 1,
    gap: 2,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: "700",
  },
  commentText: {
    fontSize: 13,
    lineHeight: 18,
  },
  commentDate: {
    fontSize: 11,
  },
  commentInputRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginTop: 16,
  },
  commentSendBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 8,
  },
  emptyBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
