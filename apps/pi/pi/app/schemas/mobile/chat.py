# SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
# SPDX-License-Identifier: LicenseRef-Plane-Commercial
#
# Licensed under the Plane Commercial License (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# https://plane.so/legals/eula
#
# DO NOT remove or modify this notice.
# NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.

from pi.app.schemas.chat import ChatFeedback
from pi.app.schemas.chat import ChatInitializationRequest
from pi.app.schemas.chat import ChatRequest
from pi.app.schemas.chat import ChatSearchRequest
from pi.app.schemas.chat import ChatSearchResponse
from pi.app.schemas.chat import ChatSearchResult
from pi.app.schemas.chat import ChatStartResponse
from pi.app.schemas.chat import ChatSuggestion
from pi.app.schemas.chat import ChatSuggestionTemplate
from pi.app.schemas.chat import ChatType
from pi.app.schemas.chat import DeleteChatRequest
from pi.app.schemas.chat import FavoriteChatRequest
from pi.app.schemas.chat import FeedbackType
from pi.app.schemas.chat import GetThreads
from pi.app.schemas.chat import ModelInfo
from pi.app.schemas.chat import ModelsResponse
from pi.app.schemas.chat import PaginationRequest
from pi.app.schemas.chat import PaginationResponse
from pi.app.schemas.chat import RenameChatRequest
from pi.app.schemas.chat import TitleRequest
from pi.app.schemas.chat import UnfavoriteChatRequest

ChatRequestMobile = ChatRequest
ChatInitializationRequestMobile = ChatInitializationRequest
TitleRequestMobile = TitleRequest
GetThreadsMobile = GetThreads
ChatTypeMobile = ChatType
ChatSuggestionMobile = ChatSuggestion
ChatSuggestionTemplateMobile = ChatSuggestionTemplate
ChatStartResponseMobile = ChatStartResponse
FeedbackTypeMobile = FeedbackType
ChatFeedbackMobile = ChatFeedback
ModelInfoMobile = ModelInfo
ModelsResponseMobile = ModelsResponse
DeleteChatRequestMobile = DeleteChatRequest
FavoriteChatRequestMobile = FavoriteChatRequest
RenameChatRequestMobile = RenameChatRequest
UnfavoriteChatRequestMobile = UnfavoriteChatRequest
ChatSearchRequestMobile = ChatSearchRequest
ChatSearchResponseMobile = ChatSearchResponse
ChatSearchResultMobile = ChatSearchResult
PaginationRequestMobile = PaginationRequest
PaginationResponseMobile = PaginationResponse
