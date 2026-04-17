import React from 'react';
import MockModulePage from '../../components/common/MockModulePage';
import { modulePageMockData } from '../../services/mock/modulePagesMockData';

const CourseView = () => <MockModulePage {...modulePageMockData.courseView} />;

export default CourseView;
