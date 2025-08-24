import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical, 
  BookOpen, 
  FileText, 
  Video, 
  ClipboardList,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ChapterManagementProps {
  classes: any[];
  subjects: any[];
}

export function ChapterManagement({ classes, subjects }: ChapterManagementProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<any>(null);
  const [newChapterName, setNewChapterName] = useState("");
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filter subjects by selected class
  const filteredSubjects = selectedClassId === "all" 
    ? subjects 
    : subjects.filter(subject => subject.classId === selectedClassId);

  // Get chapters for selected subject
  const chaptersQuery = useQuery({
    queryKey: ['/api/admin/subjects', selectedSubjectId, 'chapters'],
    enabled: !!selectedSubjectId,
  });

  // Create chapter mutation
  const createChapterMutation = useMutation({
    mutationFn: async (data: { name: string; subjectId: string }) => {
      return await apiRequest('POST', '/api/admin/chapters', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subjects', selectedSubjectId, 'chapters'] });
      setIsCreateDialogOpen(false);
      setNewChapterName("");
      toast({
        title: "Chapter Created",
        description: "New chapter has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create chapter. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update chapter mutation
  const updateChapterMutation = useMutation({
    mutationFn: async (data: { id: string; name: string }) => {
      return await apiRequest('PUT', `/api/admin/chapters/${data.id}`, { name: data.name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subjects', selectedSubjectId, 'chapters'] });
      setIsEditDialogOpen(false);
      setEditingChapter(null);
      toast({
        title: "Chapter Updated",
        description: "Chapter has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update chapter. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete chapter mutation
  const deleteChapterMutation = useMutation({
    mutationFn: async (chapterId: string) => {
      return await apiRequest('DELETE', `/api/admin/chapters/${chapterId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subjects', selectedSubjectId, 'chapters'] });
      toast({
        title: "Chapter Deleted",
        description: "Chapter has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete chapter. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCreateChapter = () => {
    if (!newChapterName.trim() || !selectedSubjectId) return;
    
    createChapterMutation.mutate({
      name: newChapterName.trim(),
      subjectId: selectedSubjectId
    });
  };

  const handleEditChapter = () => {
    if (!editingChapter || !editingChapter.name.trim()) return;
    
    updateChapterMutation.mutate({
      id: editingChapter.id,
      name: editingChapter.name.trim()
    });
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (confirm("Are you sure you want to delete this chapter? This action cannot be undone.")) {
      deleteChapterMutation.mutate(chapterId);
    }
  };

  const toggleSubjectExpansion = (subjectId: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId);
    } else {
      newExpanded.add(subjectId);
    }
    setExpandedSubjects(newExpanded);
  };

  const getContentTypeIcons = (chapter: any) => {
    const icons = [];
    if (chapter.hasNotes) icons.push(<FileText key="notes" className="h-4 w-4 text-blue-600" />);
    if (chapter.hasPyqs) icons.push(<ClipboardList key="pyqs" className="h-4 w-4 text-green-600" />);
    if (chapter.hasVideos) icons.push(<Video key="videos" className="h-4 w-4 text-red-600" />);
    return icons;
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chapter Management</h2>
          <p className="text-gray-600">Organize and manage chapters for each subject</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="class-filter">Filter by Class</Label>
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger id="class-filter" data-testid="select-class-filter">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((cls: any) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label htmlFor="subject-filter">Select Subject</Label>
          <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
            <SelectTrigger id="subject-filter" data-testid="select-subject-filter">
              <SelectValue placeholder="Select subject to manage chapters" />
            </SelectTrigger>
            <SelectContent>
              {filteredSubjects.map((subject: any) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name} ({classes.find(c => c.id === subject.classId)?.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Subject Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubjects.map((subject: any) => (
          <Card key={subject.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{subject.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSubjectExpansion(subject.id)}
                  data-testid={`button-toggle-${subject.id}`}
                >
                  {expandedSubjects.has(subject.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <CardDescription>
                Class: {classes.find(c => c.id === subject.classId)?.name} • {subject.chapterCount || 0} chapters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {subject.chapterCount || 0} Chapters
                </Badge>
                <Button
                  size="sm"
                  onClick={() => setSelectedSubjectId(subject.id)}
                  data-testid={`button-manage-${subject.id}`}
                >
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chapter Management Section */}
      {selectedSubjectId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Chapters for {filteredSubjects.find(s => s.id === selectedSubjectId)?.name}
                </CardTitle>
                <CardDescription>
                  Manage chapters, their order, and content types
                </CardDescription>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-chapter">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Chapter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Chapter</DialogTitle>
                    <DialogDescription>
                      Add a new chapter to {filteredSubjects.find(s => s.id === selectedSubjectId)?.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="chapter-name">Chapter Name</Label>
                      <Input
                        id="chapter-name"
                        value={newChapterName}
                        onChange={(e) => setNewChapterName(e.target.value)}
                        placeholder="Enter chapter name"
                        data-testid="input-chapter-name"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleCreateChapter}
                      disabled={createChapterMutation.isPending || !newChapterName.trim()}
                      data-testid="button-create-chapter"
                    >
                      {createChapterMutation.isPending ? "Creating..." : "Create Chapter"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {chaptersQuery.isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-sm text-gray-600">Loading chapters...</p>
              </div>
            ) : Array.isArray(chaptersQuery.data) && chaptersQuery.data.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No chapters yet</p>
                <p className="text-sm text-gray-500">Create your first chapter to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Array.isArray(chaptersQuery.data) && chaptersQuery.data.map((chapter: any, index: number) => (
                  <div 
                    key={chapter.id} 
                    className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Ch. {index + 1}
                        </Badge>
                        <span className="font-medium">{chapter.name}</span>
                      </div>
                      <div className="flex gap-1">
                        {getContentTypeIcons(chapter)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingChapter({ ...chapter });
                          setIsEditDialogOpen(true);
                        }}
                        data-testid={`button-edit-${chapter.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteChapter(chapter.id)}
                        className="text-red-600 hover:text-red-700"
                        data-testid={`button-delete-${chapter.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Chapter Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Chapter</DialogTitle>
            <DialogDescription>
              Update the chapter name
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-chapter-name">Chapter Name</Label>
              <Input
                id="edit-chapter-name"
                value={editingChapter?.name || ""}
                onChange={(e) => setEditingChapter({ ...editingChapter, name: e.target.value })}
                placeholder="Enter chapter name"
                data-testid="input-edit-chapter-name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleEditChapter}
              disabled={updateChapterMutation.isPending || !editingChapter?.name?.trim()}
              data-testid="button-update-chapter"
            >
              {updateChapterMutation.isPending ? "Updating..." : "Update Chapter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}