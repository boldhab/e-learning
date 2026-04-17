import { mockCourses } from './mock/mockData';

const courseContent = mockCourses.map((course) => ({
  courseId: course.id,
  title: course.title,
  resources: [
    { id: `${course.id}-pdf`, type: 'pdf', name: `${course.title} Notes` },
    { id: `${course.id}-video`, type: 'video', name: `${course.title} Recording` },
  ],
}));

export const contentService = {
  getAll: async () => courseContent,

  getByCourseId: async (courseId) =>
    courseContent.find((item) => String(item.courseId) === String(courseId)) || null,

  addResource: async ({ courseId, resource }) => {
    const target = courseContent.find((item) => String(item.courseId) === String(courseId));
    if (!target) throw new Error('Course content not found');
    const newResource = {
      id: `${courseId}-${Date.now()}`,
      type: resource?.type || 'file',
      name: resource?.name || 'Untitled Resource',
    };
    target.resources.push(newResource);
    return newResource;
  },
};

export default contentService;
