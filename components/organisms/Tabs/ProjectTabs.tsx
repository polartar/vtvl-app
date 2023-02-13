import { Typography } from '@components/atoms/Typography/Typography';
import React, { useCallback, useEffect, useState } from 'react';

export type ProjectOption = {
  label: string;
  value: string;
};

export interface ProjectTabsProps {
  title: string;
  projects: ProjectOption[];
  initialSelectedProject: ProjectOption;
  onSelectProject: (project: ProjectOption) => void;
  className?: string;
}

export default function ProjectTabs({
  title,
  projects,
  initialSelectedProject,
  onSelectProject,
  className = ''
}: ProjectTabsProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectOption>(initialSelectedProject);

  const handleSelectProject = useCallback(
    (project: ProjectOption) => () => {
      setSelectedProject(project);
      onSelectProject(project);
    },
    [onSelectProject]
  );

  useEffect(() => {
    setSelectedProject(initialSelectedProject);
  }, [initialSelectedProject]);

  return (
    <div className={`flex items-center ${className}`}>
      <Typography variant="sora" size="paragraph" className="font-semibold pr-6">
        {title}
      </Typography>
      <div className="bg-white border border-neutral-300 rounded-8 flex items-center overflow-hidden">
        {projects.map((project) => (
          <button
            key={project.value}
            type="button"
            className={`py-2 px-4 !rounded-none ${
              selectedProject.value === project.value ? 'bg-primary-50' : 'bg-white'
            }`}
            onClick={handleSelectProject(project)}>
            <Typography size="body" className="font-medium text-neutral-500">
              {project.label}
            </Typography>
          </button>
        ))}
      </div>
    </div>
  );
}
