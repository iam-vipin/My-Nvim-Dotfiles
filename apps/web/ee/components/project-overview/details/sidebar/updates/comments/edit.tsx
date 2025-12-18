import { useState } from "react";
import { Button } from "@plane/propel/button";
import { Input } from "@plane/ui";
import type { TProjectUpdatesComment } from "@/plane-web/types";
import type { TActivityOperations } from "./comment-list";

type TProps = {
  commentData: TProjectUpdatesComment;
  setIsEditing: (isEditing: boolean) => void;
  operations: TActivityOperations;
};
export function EditComment(props: TProps) {
  const { commentData, operations, setIsEditing } = props;
  const [newComment, setNewComment] = useState(commentData.description);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    operations.update(commentData.id, {
      description: newComment,
    });
    setIsEditing(false);
  };
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <Input
        placeholder="Write your comment"
        value={newComment}
        onChange={(e) => {
          setNewComment(e.target.value);
        }}
        className="w-full shadow border-subtle mb-2"
      />
      {/* actions */}
      <div className="flex text-13 gap-2 w-fit">
        <Button type="submit" disabled={newComment === ""}>
          Add update
        </Button>
        <Button onClick={() => setIsEditing(false)} variant="secondary">
          Cancel
        </Button>
      </div>
    </form>
  );
}
