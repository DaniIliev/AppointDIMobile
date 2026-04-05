import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { apiRequest } from "../../lib/http";
import {
  KanbanBoard,
  KanbanCard,
  KanbanColumn,
  KanbanUser,
} from "../../Global/Types/kanban";
import {
  BoardModalView,
  BoardSelector,
  CardModalView,
  ColumnModalView,
  ColumnView,
} from "./kanban/components";
import { ss } from "./kanban/styles";
import { alpha, useKanbanTheme } from "./kanban/theme";

export default function KanbanScreen() {
  const { session } = useAuth();
  const token = session?.token ?? "";
  const businessId = session?.user?.businessId ?? "";
  const theme = useKanbanTheme();
  const primaryColor = theme.primary;

  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [availableUsers, setAvailableUsers] = useState<KanbanUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [boardModalMode, setBoardModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [boardTitle, setBoardTitle] = useState("");

  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [columnModalMode, setColumnModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [selectedColumn, setSelectedColumn] = useState<KanbanColumn | null>(
    null,
  );

  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [cardModalMode, setCardModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | undefined>(
    undefined,
  );

  const loadData = useCallback(async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const boardsData = await apiRequest<KanbanBoard[]>(
        `/api/kanban/boards?businessId=${businessId}`,
        { token },
      );
      if (boardsData?.length > 0) {
        setBoards(boardsData);
        const firstBoard = boardsData[0];
        setSelectedBoardId(firstBoard._id);
        const fullBoard = await apiRequest<KanbanBoard>(
          `/api/kanban/boards/${firstBoard._id}`,
          { token },
        );
        setColumns(fullBoard.columns ?? []);
      } else {
        setBoards([]);
        setSelectedBoardId(null);
        setColumns([]);
      }

      const members = await apiRequest<KanbanUser[]>(
        `/api/kanban/business/${businessId}/members`,
        { token },
      );
      setAvailableUsers(members ?? []);
    } catch (error) {
      console.error("Kanban load error", error);
      Alert.alert("Грешка", "Неуспешно зареждане на канбан данни");
    } finally {
      setLoading(false);
    }
  }, [businessId, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectBoard = async (id: string) => {
    setSelectedBoardId(id);
    setLoading(true);
    try {
      const fullBoard = await apiRequest<KanbanBoard>(
        `/api/kanban/boards/${id}`,
        { token },
      );
      setColumns(fullBoard.columns ?? []);
    } catch {
      Alert.alert("Грешка", "Неуспешно зареждане на борд");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBoard = async () => {
    if (!boardTitle.trim()) return;

    try {
      if (boardModalMode === "create") {
        const newBoard = await apiRequest<KanbanBoard>("/api/kanban/boards", {
          token,
          method: "POST",
          body: { title: boardTitle, description: "", businessId },
        });
        setBoards((previous) => [...previous, newBoard]);
        await handleSelectBoard(newBoard._id);
      } else {
        const updatedBoard = await apiRequest<KanbanBoard>(
          `/api/kanban/boards/${selectedBoardId}`,
          {
            token,
            method: "PUT",
            body: { title: boardTitle },
          },
        );
        setBoards((previous) =>
          previous.map((board) =>
            board._id === updatedBoard._id
              ? { ...board, title: updatedBoard.title }
              : board,
          ),
        );
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
        text: "Изтрий",
        style: "destructive",
        onPress: async () => {
          try {
            await apiRequest(`/api/kanban/boards/${selectedBoardId}`, {
              token,
              method: "DELETE",
            });
            const nextBoards = boards.filter(
              (board) => board._id !== selectedBoardId,
            );
            setBoards(nextBoards);
            if (nextBoards.length > 0) {
              await handleSelectBoard(nextBoards[0]._id);
            } else {
              setSelectedBoardId(null);
              setColumns([]);
            }
          } catch {
            Alert.alert("Грешка", "Неуспешно изтриване");
          }
        },
      },
    ]);
  };

  const handleSaveColumn = async (
    data: { title: string; color: string; limit?: number },
    mode: "create" | "edit",
  ) => {
    try {
      if (mode === "create") {
        if (!selectedBoardId) return;
        const newColumn = await apiRequest<KanbanColumn>(
          "/api/kanban/columns",
          {
            token,
            method: "POST",
            body: {
              title: data.title,
              color: data.color,
              limit: data.limit ?? null,
              boardId: selectedBoardId,
            },
          },
        );
        setColumns((previous) => [...previous, { ...newColumn, cards: [] }]);
      } else if (selectedColumn) {
        const updatedColumn = await apiRequest<KanbanColumn>(
          `/api/kanban/columns/${selectedColumn._id}`,
          {
            token,
            method: "PUT",
            body: {
              title: data.title,
              color: data.color,
              limit: data.limit ?? null,
            },
          },
        );
        setColumns((previous) =>
          previous.map((column) =>
            column._id === updatedColumn._id
              ? { ...column, ...updatedColumn }
              : column,
          ),
        );
      }
    } catch {
      Alert.alert("Грешка", "Неуспешно запазване на колона");
    }
  };

  const handleDeleteColumn = (columnId: string) => {
    Alert.alert(
      "Изтриване",
      "Сигурни ли сте, че искате да изтриете колоната?",
      [
        { text: "Откажи", style: "cancel" },
        {
          text: "Изтрий",
          style: "destructive",
          onPress: async () => {
            try {
              await apiRequest(`/api/kanban/columns/${columnId}`, {
                token,
                method: "DELETE",
              });
              setColumns((previous) =>
                previous.filter((column) => column._id !== columnId),
              );
            } catch {
              Alert.alert("Грешка", "Неуспешно изтриване на колона");
            }
          },
        },
      ],
    );
  };

  const handleSaveCard = async (
    data: Partial<KanbanCard>,
    mode: "create" | "edit",
  ) => {
    try {
      const payload = {
        ...data,
        assignedUsers:
          data.assignedUsers?.map((user: KanbanUser) => user._id) ?? [],
      };

      if (mode === "create") {
        const newCard = await apiRequest<KanbanCard>("/api/kanban/cards", {
          token,
          method: "POST",
          body: payload,
        });
        setColumns((previous) =>
          previous.map((column) =>
            column._id === newCard.columnId
              ? { ...column, cards: [...column.cards, newCard] }
              : column,
          ),
        );
      } else {
        const updatedCard = await apiRequest<KanbanCard>(
          `/api/kanban/cards/${data._id}`,
          {
            token,
            method: "PUT",
            body: payload,
          },
        );
        setColumns((previous) =>
          previous.map((column) => ({
            ...column,
            cards: column.cards.map((card) =>
              card._id === updatedCard._id ? updatedCard : card,
            ),
          })),
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
        text: "Изтрий",
        style: "destructive",
        onPress: async () => {
          try {
            await apiRequest(`/api/kanban/cards/${cardId}`, {
              token,
              method: "DELETE",
            });
            setColumns((previous) =>
              previous.map((column) => ({
                ...column,
                cards: column.cards.filter((card) => card._id !== cardId),
              })),
            );
          } catch {
            Alert.alert("Грешка", "Неуспешно изтриване на карта");
          }
        },
      },
    ]);
  };

  const handleAddComment = async (cardId: string, text: string) => {
    try {
      const updatedCard = await apiRequest<KanbanCard>(
        `/api/kanban/cards/${cardId}/comments`,
        {
          token,
          method: "POST",
          body: { text },
        },
      );
      setColumns((previous) =>
        previous.map((column) => ({
          ...column,
          cards: column.cards.map((card) =>
            card._id === cardId ? updatedCard : card,
          ),
        })),
      );
      setSelectedCard(updatedCard);
    } catch {
      Alert.alert("Грешка", "Неуспешно добавяне на коментар");
    }
  };

  const handleDeleteComment = async (cardId: string, commentId: string) => {
    try {
      const updatedCard = await apiRequest<KanbanCard>(
        `/api/kanban/cards/${cardId}/comments/${commentId}`,
        {
          token,
          method: "DELETE",
        },
      );
      setColumns((previous) =>
        previous.map((column) => ({
          ...column,
          cards: column.cards.map((card) =>
            card._id === cardId ? updatedCard : card,
          ),
        })),
      );
      setSelectedCard(updatedCard);
    } catch {
      Alert.alert("Грешка", "Неуспешно изтриване на коментар");
    }
  };

  if (loading) {
    return (
      <View style={ss.centered}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  return (
    <View style={[ss.container, { backgroundColor: theme.bg }]}>
      <View
        style={[
          ss.toolbar,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <BoardSelector
          boards={boards}
          selectedId={selectedBoardId}
          theme={theme}
          primaryColor={primaryColor}
          onSelect={handleSelectBoard}
          onCreateBoard={() => {
            setBoardModalMode("create");
            setBoardTitle("");
            setBoardModalOpen(true);
          }}
          onEditBoard={() => {
            const board = boards.find((item) => item._id === selectedBoardId);
            if (board) {
              setBoardModalMode("edit");
              setBoardTitle(board.title);
              setBoardModalOpen(true);
            }
          }}
          onDeleteBoard={handleDeleteBoard}
        />
      </View>

      {boards.length === 0 ? (
        <View style={ss.centered}>
          <Ionicons
            name="albums-outline"
            size={56}
            color={alpha(primaryColor, "66")}
          />
          <Text style={[ss.emptyTitle, { color: theme.text }]}>
            Няма бордове
          </Text>
          <Text style={[ss.emptySubtitle, { color: theme.mutedText }]}>
            Създай първия си канбан борд
          </Text>
          <TouchableOpacity
            style={[ss.emptyBtn, { backgroundColor: primaryColor }]}
            onPress={() => {
              setBoardModalMode("create");
              setBoardTitle("");
              setBoardModalOpen(true);
            }}
          >
            <Ionicons name="add" size={18} color={theme.bg} />
            <Text style={[ss.emptyBtnText, { color: theme.bg }]}>
              Създай борд
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={[ss.addColumnBtn, { borderColor: primaryColor }]}
            onPress={() => {
              setColumnModalMode("create");
              setSelectedColumn(null);
              setColumnModalOpen(true);
            }}
          >
            <Ionicons name="add" size={16} color={primaryColor} />
            <Text style={[ss.addColumnBtnText, { color: primaryColor }]}>
              Добави колона
            </Text>
          </TouchableOpacity>

          {columns.length === 0 ? (
            <View style={ss.centered}>
              <Ionicons name="list-outline" size={44} color={theme.border} />
              <Text style={[ss.emptyTitle, { color: theme.text }]}>
                Няма колони
              </Text>
              <Text style={[ss.emptySubtitle, { color: theme.mutedText }]}>
                Добави колона, за да започнеш
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={ss.columnsContainer}
            >
              {columns.map((column) => (
                <ColumnView
                  key={column._id}
                  column={column}
                  theme={theme}
                  primaryColor={primaryColor}
                  onAddCard={() => {
                    setCardModalMode("create");
                    setSelectedCard(null);
                    setSelectedColumnId(column._id);
                    setCardModalOpen(true);
                  }}
                  onEditColumn={() => {
                    setColumnModalMode("edit");
                    setSelectedColumn(column);
                    setColumnModalOpen(true);
                  }}
                  onDeleteColumn={() => handleDeleteColumn(column._id)}
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

      <BoardModalView
        visible={boardModalOpen}
        mode={boardModalMode}
        title={boardTitle}
        theme={theme}
        primaryColor={primaryColor}
        onClose={() => setBoardModalOpen(false)}
        onChange={setBoardTitle}
        onSave={handleSaveBoard}
      />

      <ColumnModalView
        visible={columnModalOpen}
        mode={columnModalMode}
        column={selectedColumn}
        theme={theme}
        primaryColor={primaryColor}
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
        primaryColor={primaryColor}
        onClose={() => setCardModalOpen(false)}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
      />
    </View>
  );
}
