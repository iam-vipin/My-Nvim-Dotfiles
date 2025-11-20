import type { Meta, StoryObj } from "@storybook/react-vite";

import type { MilestoneIconVariant } from "./milestone";
import { MilestoneIcon } from "./milestone";

const meta: Meta<typeof MilestoneIcon> = {
  title: "Icons/MilestoneIcon",
  component: MilestoneIcon,
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "done",
        "in_progress",
        "not_started_yet",
        "started_no_progress",
      ] satisfies MilestoneIconVariant[],
    },
    className: {
      control: "text",
    },
  },
  args: {
    className: "size-6",
  },
};

export default meta;
type Story = StoryObj<typeof MilestoneIcon>;

export const AllVariants: Story = {
  render: (args) => (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-1">
        <MilestoneIcon {...args} />
        <span className="text-xs text-neutral-500">default</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <MilestoneIcon {...args} variant="in_progress" />
        <span className="text-xs text-neutral-500">in_progress</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <MilestoneIcon {...args} variant="started_no_progress" />
        <span className="text-xs text-neutral-500">started_no_progress</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <MilestoneIcon {...args} variant="not_started_yet" />
        <span className="text-xs text-neutral-500">not_started_yet</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <MilestoneIcon {...args} variant="done" />
        <span className="text-xs text-neutral-500">done</span>
      </div>
    </div>
  ),
};

export const Default: Story = {
  args: { variant: "default" },
};

export const InProgress: Story = {
  args: { variant: "in_progress" },
};

export const StartedNoProgress: Story = {
  args: { variant: "started_no_progress" },
};

export const NotStartedYet: Story = {
  args: { variant: "not_started_yet" },
};

export const Done: Story = {
  args: { variant: "done" },
};
