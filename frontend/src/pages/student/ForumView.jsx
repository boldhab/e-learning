import React from 'react';
import MockModulePage from '../../components/common/MockModulePage';
import { modulePageMockData } from '../../services/mock/modulePagesMockData';

const ForumView = () => <MockModulePage {...modulePageMockData.forumView} />;

export default ForumView;
