import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Colors";
import {
  KanbanBoard,
  KanbanColumn,
  KanbanCard,
  KanbanUser,
  Priority,
  CardStatus,
} from "../../../Global/Types/kanban";
import {
  ThemePalette,
  alpha,
  getColumnPalette,
  getPriorityColors,
  getStatusColors,
} from "./theme";
import { ss } from "./styles";

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("bg-BG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function initials(user: KanbanUser) {
  return `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
}

interface AvatarBubbleProps {
  user: KanbanUser;
  size?: number;
  theme: ThemePalette;
}
function AvatarBubble({ user, size = 26, theme }: AvatarBubbleProps) {
  return (
    <View
      style={[
        ss.avatarBubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.primary,
        },
      ]}
    >
      <Text style={[ss.avatarText, { fontSize: size * 0.38, color: theme.bg }]}>
        {initials(user)}
      </Text>
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
    <View
      style={[
        ss.badge,
        { backgroundColor: alpha(priorityColors[priority], "22") },
      ]}
    >
      <View
        style={[ss.badgeDot, { backgroundColor: priorityColors[priority] }]}
      />
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
    <View
      style={[ss.badge, { backgroundColor: alpha(statusColors[status], "22") }]}
    >
      <Text style={[ss.badgeText, { color: statusColors[status] }]}>
        {status}
      </Text>
    </View>
  );
}

interface CardItemProps {
  card: KanbanCard;
  columnColor: string;
  theme: ThemePalette;
  onPress: () => void;
  onDelete: () => void;
}
function CardItem({
  card,
  columnColor,
  theme,
  onPress,
  onDelete,
}: CardItemProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  return (
    <TouchableOpacity
      style={[
        ss.cardItem,
        {
          backgroundColor: theme.surface,
          shadowColor: theme.text,
          borderColor: theme.border,
          borderWidth: 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[ss.cardColorBar, { backgroundColor: columnColor }]} />
      <View style={ss.cardBody}>
        <View style={ss.cardHeader}>
          <Text style={[ss.cardTitle, { color: theme.text }]} numberOfLines={2}>
            {card.title}
          </Text>
          <TouchableOpacity onPress={() => setMenuVisible(true)} hitSlop={8}>
            <Ionicons
              name="ellipsis-horizontal"
              size={16}
              color={theme.mutedText}
            />
          </TouchableOpacity>
        </View>

        {card.description ? (
          <Text
            style={[ss.cardDesc, { color: theme.mutedText }]}
            numberOfLines={2}
          >
            {card.description}
          </Text>
        ) : null}

        <View style={ss.cardMeta}>
          {card.priority && (
            <PriorityBadge priority={card.priority} theme={theme} />
          )}
          {card.status && <StatusBadge status={card.status} theme={theme} />}
        </View>

        {card.endDate ? (
          <View style={ss.cardDateRow}>
            <Ionicons
              name="calendar-outline"
              size={12}
              color={theme.mutedText}
            />
            <Text style={[ss.cardDateText, { color: theme.mutedText }]}>
              {formatDate(card.endDate)}
            </Text>
          </View>
        ) : null}

        {card.assignedUsers?.length > 0 && (
          <View style={ss.cardAvatarRow}>
            {card.assignedUsers.slice(0, 4).map((u, idx) => (
              <View
                key={u._id}
                style={[
                  ss.avatarOverlap,
                  {
                    zIndex: 10 - idx,
                    marginLeft: idx === 0 ? 0 : -8,
                    borderColor: theme.surface,
                  },
                ]}
              >
                <AvatarBubble user={u} size={24} theme={theme} />
              </View>
            ))}
            {card.assignedUsers.length > 4 && (
              <Text style={[ss.moreAvatars, { color: theme.mutedText }]}>
                +{card.assignedUsers.length - 4}
              </Text>
            )}
          </View>
        )}

        <View style={ss.cardFooter}>
          {card.comments?.length > 0 && (
            <View style={ss.cardFooterItem}>
              <Ionicons
                name="chatbubble-outline"
                size={12}
                color={theme.mutedText}
              />
              <Text style={[ss.cardFooterText, { color: theme.mutedText }]}>
                {card.comments.length}
              </Text>
            </View>
          )}
          {card.attachments?.length > 0 && (
            <View style={ss.cardFooterItem}>
              <Ionicons
                name="attach-outline"
                size={12}
                color={theme.mutedText}
              />
              <Text style={[ss.cardFooterText, { color: theme.mutedText }]}>
                {card.attachments.length}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={[ss.menuOverlay, { backgroundColor: alpha(theme.text, "35") }]}
          onPress={() => setMenuVisible(false)}
        >
          <View
            style={[
              ss.menuPopup,
              { backgroundColor: theme.surface, shadowColor: theme.text },
            ]}
          >
            <TouchableOpacity
              style={ss.menuItem}
              onPress={() => {
                setMenuVisible(false);
                onPress();
              }}
            >
              <Ionicons name="pencil-outline" size={16} color={theme.text} />
              <Text style={[ss.menuItemText, { color: theme.text }]}>
                Редактирай
              </Text>
            </TouchableOpacity>
            <View style={[ss.menuDivider, { backgroundColor: theme.border }]} />
            <TouchableOpacity
              style={ss.menuItem}
              onPress={() => {
                setMenuVisible(false);
                onDelete();
              }}
            >
              <Ionicons name="trash-outline" size={16} color={theme.danger} />
              <Text style={[ss.menuItemText, { color: theme.danger }]}>
                Изтрий
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </TouchableOpacity>
  );
}

interface ColumnViewProps {
  column: KanbanColumn;
  theme: ThemePalette;
  primaryColor: string;
  onAddCard: () => void;
  onEditColumn: () => void;
  onDeleteColumn: () => void;
  onEditCard: (card: KanbanCard) => void;
  onDeleteCard: (cardId: string) => void;
}

export function ColumnView({
  column,
  theme,
  primaryColor,
  onAddCard,
  onEditColumn,
  onDeleteColumn,
  onEditCard,
  onDeleteCard,
}: ColumnViewProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const isOverLimit =
    column.limit != null && column.cards.length >= column.limit;

  return (
    <View
      style={[
        ss.column,
        {
          width: Dimensions.get("window").width * 0.78,
          backgroundColor: theme.surface,
          shadowColor: theme.text,
        },
      ]}
    >
      <View
        style={[
          ss.columnHeader,
          { borderLeftColor: column.color, borderBottomColor: theme.border },
        ]}
      >
        <View style={ss.columnHeaderLeft}>
          <View
            style={[ss.columnColorDot, { backgroundColor: column.color }]}
          />
          <Text
            style={[ss.columnTitle, { color: theme.text }]}
            numberOfLines={1}
          >
            {column.title}
          </Text>
          <View style={[ss.columnCount, { backgroundColor: theme.bg }]}>
            <Text
              style={[
                ss.columnCountText,
                { color: isOverLimit ? theme.danger : theme.mutedText },
              ]}
            >
              {column.cards.length}
              {column.limit != null ? `/${column.limit}` : ""}
            </Text>
          </View>
        </View>
        <View style={ss.columnHeaderRight}>
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            hitSlop={8}
            style={ss.columnMenuBtn}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={16}
              color={theme.mutedText}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 12 }}
      >
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
          <Ionicons
            name="add"
            size={16}
            color={isOverLimit ? theme.mutedText : primaryColor}
          />
          <Text
            style={[
              ss.columnTopAddText,
              { color: isOverLimit ? theme.mutedText : primaryColor },
            ]}
          >
            Add
          </Text>
        </TouchableOpacity>

        {column.cards.length === 0 ? (
          <View style={ss.emptyColumnHint}>
            <Text style={[ss.emptyColumnText, { color: theme.mutedText }]}>
              Няма карти
            </Text>
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

      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={[ss.menuOverlay, { backgroundColor: alpha(theme.text, "35") }]}
          onPress={() => setMenuVisible(false)}
        >
          <View
            style={[
              ss.menuPopup,
              { backgroundColor: theme.surface, shadowColor: theme.text },
            ]}
          >
            <TouchableOpacity
              style={ss.menuItem}
              onPress={() => {
                setMenuVisible(false);
                onEditColumn();
              }}
            >
              <Ionicons name="pencil-outline" size={16} color={theme.text} />
              <Text style={[ss.menuItemText, { color: theme.text }]}>
                Редактирай колона
              </Text>
            </TouchableOpacity>
            <View style={[ss.menuDivider, { backgroundColor: theme.border }]} />
            <TouchableOpacity
              style={ss.menuItem}
              onPress={() => {
                setMenuVisible(false);
                onDeleteColumn();
              }}
            >
              <Ionicons name="trash-outline" size={16} color={theme.danger} />
              <Text style={[ss.menuItemText, { color: theme.danger }]}>
                Изтрий колона
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

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

export function BoardSelector({
  boards,
  selectedId,
  theme,
  primaryColor,
  onSelect,
  onCreateBoard,
  onEditBoard,
  onDeleteBoard,
}: BoardSelectorProps) {
  const [open, setOpen] = useState(false);
  const selected = boards.find((b) => b._id === selectedId);

  return (
    <View style={ss.boardSelectorRow}>
      <TouchableOpacity
        style={[ss.boardSelectorBtn, { borderColor: primaryColor }]}
        onPress={() => setOpen(true)}
      >
        <Ionicons name="layers-outline" size={16} color={primaryColor} />
        <Text
          style={[ss.boardSelectorText, { color: primaryColor }]}
          numberOfLines={1}
        >
          {selected ? selected.title : "Избери борд"}
        </Text>
        <Ionicons name="chevron-down" size={14} color={primaryColor} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          ss.boardIconBtn,
          { backgroundColor: alpha(primaryColor, "18") },
        ]}
        onPress={onCreateBoard}
      >
        <Ionicons name="add" size={20} color={primaryColor} />
      </TouchableOpacity>

      {selectedId && (
        <>
          <TouchableOpacity
            style={[ss.boardIconBtn, { backgroundColor: theme.bg }]}
            onPress={onEditBoard}
          >
            <Ionicons name="pencil-outline" size={18} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[ss.boardIconBtn, { backgroundColor: theme.bg }]}
            onPress={onDeleteBoard}
          >
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
          </TouchableOpacity>
        </>
      )}

      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={[ss.menuOverlay, { backgroundColor: alpha(theme.text, "35") }]}
          onPress={() => setOpen(false)}
        >
          <View
            style={[
              ss.boardDropdown,
              { backgroundColor: theme.surface, shadowColor: theme.text },
            ]}
          >
            <Text style={[ss.boardDropdownTitle, { color: theme.mutedText }]}>
              Бордове
            </Text>
            {boards.map((b) => (
              <TouchableOpacity
                key={b._id}
                style={[
                  ss.boardDropdownItem,
                  b._id === selectedId && {
                    backgroundColor: alpha(primaryColor, "18"),
                  },
                ]}
                onPress={() => {
                  setOpen(false);
                  onSelect(b._id);
                }}
              >
                <Ionicons
                  name="layers-outline"
                  size={15}
                  color={b._id === selectedId ? primaryColor : theme.text}
                />
                <Text
                  style={[
                    ss.boardDropdownItemText,
                    { color: theme.text },
                    b._id === selectedId && {
                      color: primaryColor,
                      fontWeight: "600",
                    },
                  ]}
                >
                  {b.title}
                </Text>
                {b._id === selectedId && (
                  <Ionicons name="checkmark" size={15} color={primaryColor} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

interface ColumnModalViewProps {
  visible: boolean;
  mode: "create" | "edit";
  column: KanbanColumn | null;
  theme: ThemePalette;
  primaryColor: string;
  onClose: () => void;
  onSave: (
    data: { title: string; color: string; limit?: number },
    mode: "create" | "edit",
  ) => void;
}

export function ColumnModalView({
  visible,
  mode,
  column,
  theme,
  primaryColor,
  onClose,
  onSave,
}: ColumnModalViewProps) {
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
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <Pressable
          style={[
            ss.bottomSheetOverlay,
            { backgroundColor: alpha(theme.text, "40") },
          ]}
          onPress={onClose}
        >
          <Pressable
            style={[ss.bottomSheet, { backgroundColor: theme.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[ss.sheetHandle, { backgroundColor: theme.border }]} />
            <Text style={[ss.sheetTitle, { color: theme.text }]}>
              {mode === "create" ? "Нова колона" : "Редактирай колона"}
            </Text>

            <Text style={[ss.fieldLabel, { color: theme.mutedText }]}>
              Заглавие
            </Text>
            <TextInput
              style={[
                ss.input,
                {
                  borderColor: theme.border,
                  color: theme.text,
                  backgroundColor: theme.bg,
                },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="Въведи заглавие"
              placeholderTextColor={theme.mutedText}
            />

            <Text style={[ss.fieldLabel, { color: theme.mutedText }]}>
              Цвят
            </Text>
            <View style={ss.colorPalette}>
              {columnPalette.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  style={[
                    ss.colorDot,
                    { backgroundColor: c },
                    color === c && [
                      ss.colorDotSelected,
                      { borderColor: theme.surface, shadowColor: theme.text },
                    ],
                  ]}
                />
              ))}
            </View>

            <Text style={[ss.fieldLabel, { color: theme.mutedText }]}>
              Лимит на карти (незадължително)
            </Text>
            <TextInput
              style={[
                ss.input,
                {
                  borderColor: theme.border,
                  color: theme.text,
                  backgroundColor: theme.bg,
                },
              ]}
              value={limit}
              onChangeText={setLimit}
              placeholder="Без лимит"
              placeholderTextColor={theme.mutedText}
              keyboardType="number-pad"
            />

            <View style={ss.sheetBtnRow}>
              <TouchableOpacity
                style={[ss.sheetBtnCancel, { borderColor: theme.border }]}
                onPress={onClose}
              >
                <Text
                  style={[ss.sheetBtnCancelText, { color: theme.mutedText }]}
                >
                  Откажи
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  ss.sheetBtnSave,
                  { backgroundColor: primaryColor },
                  !title.trim() && { opacity: 0.5 },
                ]}
                onPress={() => {
                  if (title.trim()) {
                    onSave(
                      {
                        title,
                        color,
                        limit: limit ? Number(limit) : undefined,
                      },
                      mode,
                    );
                    onClose();
                  }
                }}
                disabled={!title.trim()}
              >
                <Text style={[ss.sheetBtnSaveText, { color: theme.bg }]}>
                  Запази
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

interface BoardModalViewProps {
  visible: boolean;
  mode: "create" | "edit";
  title: string;
  theme: ThemePalette;
  primaryColor: string;
  onClose: () => void;
  onChange: (t: string) => void;
  onSave: () => void;
}

export function BoardModalView({
  visible,
  mode,
  title,
  theme,
  primaryColor,
  onClose,
  onChange,
  onSave,
}: BoardModalViewProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <Pressable
          style={[
            ss.bottomSheetOverlay,
            { backgroundColor: alpha(theme.text, "40") },
          ]}
          onPress={onClose}
        >
          <Pressable
            style={[ss.bottomSheet, { backgroundColor: theme.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[ss.sheetHandle, { backgroundColor: theme.border }]} />
            <Text style={[ss.sheetTitle, { color: theme.text }]}>
              {mode === "create" ? "Нов борд" : "Преименувай борд"}
            </Text>

            <Text style={[ss.fieldLabel, { color: theme.mutedText }]}>
              Заглавие
            </Text>
            <TextInput
              style={[
                ss.input,
                {
                  borderColor: theme.border,
                  color: theme.text,
                  backgroundColor: theme.bg,
                },
              ]}
              value={title}
              onChangeText={onChange}
              placeholder="Въведи заглавие"
              placeholderTextColor={theme.mutedText}
              autoFocus
            />

            <View style={ss.sheetBtnRow}>
              <TouchableOpacity
                style={[ss.sheetBtnCancel, { borderColor: theme.border }]}
                onPress={onClose}
              >
                <Text
                  style={[ss.sheetBtnCancelText, { color: theme.mutedText }]}
                >
                  Откажи
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  ss.sheetBtnSave,
                  { backgroundColor: primaryColor },
                  !title.trim() && { opacity: 0.5 },
                ]}
                onPress={() => {
                  if (title.trim()) {
                    onSave();
                  }
                }}
                disabled={!title.trim()}
              >
                <Text style={[ss.sheetBtnSaveText, { color: theme.bg }]}>
                  Запази
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

interface CardModalViewProps {
  visible: boolean;
  mode: "create" | "edit";
  card: KanbanCard | null;
  columnId?: string;
  columns: KanbanColumn[];
  availableUsers: KanbanUser[];
  theme: ThemePalette;
  primaryColor: string;
  onClose: () => void;
  onSave: (data: Partial<KanbanCard>, mode: "create" | "edit") => void;
  onDelete?: (cardId: string) => void;
  onAddComment?: (cardId: string, text: string) => void;
  onDeleteComment?: (cardId: string, commentId: string) => void;
}

export function CardModalView({
  visible,
  mode,
  card,
  columnId,
  columns,
  availableUsers,
  theme,
  primaryColor,
  onClose,
  onSave,
  onDelete,
  onAddComment,
  onDeleteComment,
}: CardModalViewProps) {
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
      prev.some((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user],
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
      mode,
    );
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View
          style={[
            ss.cardModalOverlay,
            { backgroundColor: alpha(theme.text, "40") },
          ]}
        >
          <View style={[ss.cardModalSheet, { backgroundColor: theme.surface }]}>
            <View style={[ss.sheetHandle, { backgroundColor: theme.border }]} />

            <View
              style={[ss.cardModalTabs, { borderBottomColor: theme.border }]}
            >
              <TouchableOpacity
                style={[
                  ss.cardModalTab,
                  tab === "details" && {
                    borderBottomColor: primaryColor,
                    borderBottomWidth: 2,
                  },
                ]}
                onPress={() => setTab("details")}
              >
                <Text
                  style={[
                    ss.cardModalTabText,
                    { color: theme.mutedText },
                    tab === "details" && { color: primaryColor },
                  ]}
                >
                  Детайли
                </Text>
              </TouchableOpacity>
              {mode === "edit" && (
                <TouchableOpacity
                  style={[
                    ss.cardModalTab,
                    tab === "comments" && {
                      borderBottomColor: primaryColor,
                      borderBottomWidth: 2,
                    },
                  ]}
                  onPress={() => setTab("comments")}
                >
                  <Text
                    style={[
                      ss.cardModalTabText,
                      { color: theme.mutedText },
                      tab === "comments" && { color: primaryColor },
                    ]}
                  >
                    Коментари{" "}
                    {card?.comments?.length ? `(${card.comments.length})` : ""}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {tab === "details" ? (
                <View style={{ paddingHorizontal: 16 }}>
                  <Text style={[ss.fieldLabel, { color: theme.mutedText }]}>
                    Заглавие *
                  </Text>
                  <TextInput
                    style={[
                      ss.input,
                      {
                        borderColor: theme.border,
                        color: theme.text,
                        backgroundColor: theme.bg,
                      },
                    ]}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Въведи заглавие"
                    placeholderTextColor={theme.mutedText}
                  />

                  <Text style={[ss.fieldLabel, { color: theme.mutedText }]}>
                    Описание
                  </Text>
                  <TextInput
                    style={[
                      ss.input,
                      {
                        height: 80,
                        textAlignVertical: "top",
                        borderColor: theme.border,
                        color: theme.text,
                        backgroundColor: theme.bg,
                      },
                    ]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Описание (незадължително)"
                    placeholderTextColor={theme.mutedText}
                    multiline
                  />

                  <Text style={[ss.fieldLabel, { color: theme.mutedText }]}>
                    Приоритет
                  </Text>
                  <TouchableOpacity
                    style={[
                      ss.pickerBtn,
                      { borderColor: theme.border, backgroundColor: theme.bg },
                    ]}
                    onPress={() => setShowPriorityPicker(true)}
                  >
                    <View
                      style={[
                        ss.badgeDot,
                        { backgroundColor: priorityColors[priority] },
                      ]}
                    />
                    <Text style={[ss.pickerBtnText, { color: theme.text }]}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={14}
                      color={theme.mutedText}
                    />
                  </TouchableOpacity>

                  <Text style={[ss.fieldLabel, { color: theme.mutedText }]}>
                    Статус
                  </Text>
                  <TouchableOpacity
                    style={[
                      ss.pickerBtn,
                      { borderColor: theme.border, backgroundColor: theme.bg },
                    ]}
                    onPress={() => setShowStatusPicker(true)}
                  >
                    <View
                      style={[
                        ss.badgeDot,
                        { backgroundColor: statusColors[status] },
                      ]}
                    />
                    <Text style={[ss.pickerBtnText, { color: theme.text }]}>
                      {status}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={14}
                      color={theme.mutedText}
                    />
                  </TouchableOpacity>

                  {columns.length > 0 && (
                    <>
                      <Text style={[ss.fieldLabel, { color: theme.mutedText }]}>
                        Колона
                      </Text>
                      <TouchableOpacity
                        style={[
                          ss.pickerBtn,
                          {
                            borderColor: theme.border,
                            backgroundColor: theme.bg,
                          },
                        ]}
                        onPress={() => setShowColumnPicker(true)}
                      >
                        <Text style={[ss.pickerBtnText, { color: theme.text }]}>
                          {columns.find((c) => c._id === selectedColumn)
                            ?.title ?? "Избери колона"}
                        </Text>
                        <Ionicons
                          name="chevron-down"
                          size={14}
                          color={theme.mutedText}
                        />
                      </TouchableOpacity>
                    </>
                  )}

                  <View style={ss.dateRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[ss.fieldLabel, { color: theme.mutedText }]}>
                        Начална дата
                      </Text>
                      <TextInput
                        style={[
                          ss.input,
                          {
                            borderColor: theme.border,
                            color: theme.text,
                            backgroundColor: theme.bg,
                          },
                        ]}
                        value={startDate}
                        onChangeText={setStartDate}
                        placeholder="ГГГГ-ММ-ДД"
                        placeholderTextColor={theme.mutedText}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[ss.fieldLabel, { color: theme.mutedText }]}>
                        Крайна дата
                      </Text>
                      <TextInput
                        style={[
                          ss.input,
                          {
                            borderColor: theme.border,
                            color: theme.text,
                            backgroundColor: theme.bg,
                          },
                        ]}
                        value={endDate}
                        onChangeText={setEndDate}
                        placeholder="ГГГГ-ММ-ДД"
                        placeholderTextColor={theme.mutedText}
                      />
                    </View>
                  </View>

                  <Text style={[ss.fieldLabel, { color: theme.mutedText }]}>
                    Назначени
                  </Text>
                  <TouchableOpacity
                    style={[
                      ss.pickerBtn,
                      { borderColor: theme.border, backgroundColor: theme.bg },
                    ]}
                    onPress={() => setShowUserPicker(true)}
                  >
                    {assignedUsers.length === 0 ? (
                      <Text style={[ss.pickerBtnText, { color: theme.text }]}>
                        Назначи потребители
                      </Text>
                    ) : (
                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 4,
                          flex: 1,
                        }}
                      >
                        {assignedUsers.map((u) => (
                          <View
                            key={u._id}
                            style={[
                              ss.userChip,
                              { backgroundColor: alpha(primaryColor, "22") },
                            ]}
                          >
                            <Text
                              style={[ss.userChipText, { color: primaryColor }]}
                            >
                              {u.firstName} {u.lastName}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                    <Ionicons
                      name="chevron-down"
                      size={14}
                      color={theme.mutedText}
                    />
                  </TouchableOpacity>

                  <View style={[ss.sheetBtnRow, { marginTop: 24 }]}>
                    {mode === "edit" && onDelete && card && (
                      <TouchableOpacity
                        style={[
                          ss.deleteBtn,
                          {
                            borderColor: theme.danger,
                            backgroundColor: alpha(theme.danger, "20"),
                          },
                        ]}
                        onPress={() => {
                          onDelete(card._id);
                          onClose();
                        }}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color={theme.danger}
                        />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[ss.sheetBtnCancel, { borderColor: theme.border }]}
                      onPress={onClose}
                    >
                      <Text
                        style={[
                          ss.sheetBtnCancelText,
                          { color: theme.mutedText },
                        ]}
                      >
                        Откажи
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        ss.sheetBtnSave,
                        { backgroundColor: primaryColor },
                        !title.trim() && { opacity: 0.5 },
                      ]}
                      onPress={handleSave}
                      disabled={!title.trim()}
                    >
                      <Text style={[ss.sheetBtnSaveText, { color: theme.bg }]}>
                        Запази
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={{ paddingHorizontal: 16 }}>
                  {card?.comments?.length === 0 && (
                    <Text
                      style={[ss.emptyColumnText, { color: theme.mutedText }]}
                    >
                      Няма коментари
                    </Text>
                  )}
                  {card?.comments?.map((comment) => (
                    <View
                      key={comment._id}
                      style={[
                        ss.commentItem,
                        { borderBottomColor: theme.border },
                      ]}
                    >
                      <AvatarBubble
                        user={
                          comment.user ?? {
                            _id: comment.userId,
                            firstName: "?",
                            lastName: "",
                            email: "",
                          }
                        }
                        size={30}
                        theme={theme}
                      />
                      <View style={ss.commentBody}>
                        <Text style={[ss.commentAuthor, { color: theme.text }]}>
                          {comment.user
                            ? `${comment.user.firstName} ${comment.user.lastName}`
                            : "Потребител"}
                        </Text>
                        <Text style={[ss.commentText, { color: theme.text }]}>
                          {comment.text}
                        </Text>
                        <Text
                          style={[ss.commentDate, { color: theme.mutedText }]}
                        >
                          {formatDate(comment.createdAt)}
                        </Text>
                      </View>
                      {onDeleteComment && card && (
                        <TouchableOpacity
                          onPress={() => onDeleteComment(card._id, comment._id)}
                          hitSlop={8}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={14}
                            color={theme.danger}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}

                  <View style={ss.commentInputRow}>
                    <TextInput
                      style={[
                        ss.input,
                        {
                          flex: 1,
                          marginBottom: 0,
                          borderColor: theme.border,
                          color: theme.text,
                          backgroundColor: theme.bg,
                        },
                      ]}
                      value={commentText}
                      onChangeText={setCommentText}
                      placeholder="Добави коментар..."
                      placeholderTextColor={theme.mutedText}
                    />
                    <TouchableOpacity
                      style={[
                        ss.commentSendBtn,
                        { backgroundColor: primaryColor },
                        !commentText.trim() && { opacity: 0.5 },
                      ]}
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

      <Modal
        transparent
        visible={showPriorityPicker}
        animationType="fade"
        onRequestClose={() => setShowPriorityPicker(false)}
      >
        <Pressable
          style={[ss.menuOverlay, { backgroundColor: alpha(theme.text, "35") }]}
          onPress={() => setShowPriorityPicker(false)}
        >
          <View
            style={[
              ss.menuPopup,
              { backgroundColor: theme.surface, shadowColor: theme.text },
            ]}
          >
            {(["low", "medium", "high", "urgent"] as Priority[]).map((item) => (
              <TouchableOpacity
                key={item}
                style={ss.menuItem}
                onPress={() => {
                  setPriority(item);
                  setShowPriorityPicker(false);
                }}
              >
                <View
                  style={[
                    ss.badgeDot,
                    { backgroundColor: priorityColors[item] },
                  ]}
                />
                <Text style={[ss.menuItemText, { color: theme.text }]}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
                {priority === item && (
                  <Ionicons
                    name="checkmark"
                    size={15}
                    color={priorityColors[item]}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal
        transparent
        visible={showStatusPicker}
        animationType="fade"
        onRequestClose={() => setShowStatusPicker(false)}
      >
        <Pressable
          style={[ss.menuOverlay, { backgroundColor: alpha(theme.text, "35") }]}
          onPress={() => setShowStatusPicker(false)}
        >
          <View
            style={[
              ss.menuPopup,
              { backgroundColor: theme.surface, shadowColor: theme.text },
            ]}
          >
            {(["Planned", "In Progress", "Finished"] as CardStatus[]).map(
              (item) => (
                <TouchableOpacity
                  key={item}
                  style={ss.menuItem}
                  onPress={() => {
                    setStatus(item);
                    setShowStatusPicker(false);
                  }}
                >
                  <View
                    style={[
                      ss.badgeDot,
                      { backgroundColor: statusColors[item] },
                    ]}
                  />
                  <Text style={[ss.menuItemText, { color: theme.text }]}>
                    {item}
                  </Text>
                  {status === item && (
                    <Ionicons
                      name="checkmark"
                      size={15}
                      color={statusColors[item]}
                    />
                  )}
                </TouchableOpacity>
              ),
            )}
          </View>
        </Pressable>
      </Modal>

      <Modal
        transparent
        visible={showColumnPicker}
        animationType="fade"
        onRequestClose={() => setShowColumnPicker(false)}
      >
        <Pressable
          style={[ss.menuOverlay, { backgroundColor: alpha(theme.text, "35") }]}
          onPress={() => setShowColumnPicker(false)}
        >
          <View
            style={[
              ss.menuPopup,
              { backgroundColor: theme.surface, shadowColor: theme.text },
            ]}
          >
            {columns.map((column) => (
              <TouchableOpacity
                key={column._id}
                style={ss.menuItem}
                onPress={() => {
                  setSelectedColumn(column._id);
                  setShowColumnPicker(false);
                }}
              >
                <View
                  style={[ss.badgeDot, { backgroundColor: column.color }]}
                />
                <Text style={[ss.menuItemText, { color: theme.text }]}>
                  {column.title}
                </Text>
                {selectedColumn === column._id && (
                  <Ionicons name="checkmark" size={15} color={column.color} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal
        transparent
        visible={showUserPicker}
        animationType="fade"
        onRequestClose={() => setShowUserPicker(false)}
      >
        <Pressable
          style={[ss.menuOverlay, { backgroundColor: alpha(theme.text, "35") }]}
          onPress={() => setShowUserPicker(false)}
        >
          <View
            style={[
              ss.menuPopup,
              {
                minWidth: 260,
                backgroundColor: theme.surface,
                shadowColor: theme.text,
              },
            ]}
          >
            <Text style={[ss.boardDropdownTitle, { color: theme.mutedText }]}>
              Назначи потребители
            </Text>
            {availableUsers.map((user) => {
              const isSelected = assignedUsers.some(
                (assigned) => assigned._id === user._id,
              );
              return (
                <TouchableOpacity
                  key={user._id}
                  style={ss.menuItem}
                  onPress={() => toggleUser(user)}
                >
                  <AvatarBubble user={user} size={28} theme={theme} />
                  <Text style={[ss.menuItemText, { color: theme.text }]}>
                    {user.firstName} {user.lastName}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={Colors.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[
                ss.sheetBtnSave,
                {
                  backgroundColor: primaryColor,
                  marginTop: 8,
                  alignItems: "center",
                },
              ]}
              onPress={() => setShowUserPicker(false)}
            >
              <Text style={[ss.sheetBtnSaveText, { color: theme.bg }]}>
                Готово
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </Modal>
  );
}
