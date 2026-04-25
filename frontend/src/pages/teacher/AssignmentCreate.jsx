import React from 'react';
import MockModulePage from '../../components/common/MockModulePage';
import { modulePageMockData } from '../../services/mock/modulePagesMockData';

const AssignmentCreate = () => <MockModulePage {...modulePageMockData.assignmentCreate} />;

export default AssignmentCreate;
