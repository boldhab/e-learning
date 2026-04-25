import React from 'react';
import MockModulePage from '../../components/common/MockModulePage';
import { modulePageMockData } from '../../services/mock/modulePagesMockData';

const TimetableManager = () => <MockModulePage {...modulePageMockData.timetableManager} />;

export default TimetableManager;
