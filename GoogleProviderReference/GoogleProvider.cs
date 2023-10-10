using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Google.Cloud.Translation.V2;

using Jumoo.TranslationManager.Core;
using Jumoo.TranslationManager.Core.Models;
using Jumoo.TranslationManager.Core.Providers;

using Umbraco.Core;
using Umbraco.Core.Logging;
using Umbraco.Web;

namespace Jumoo.TranslationManager.Providers.Google
{
    public class GoogleProvider : TranslateProviderBase, ITranslationProvider
    {
        public string Name => "Google Translation API (Machine)";
        public string Alias => "google";
        public Guid Key => Guid.Parse("{220C433B-F374-46C2-95E2-E7EE18FE3C76}");

        private string _apiKey;
        private bool _active;
        private int _throttle; 

        public TranslationProviderViews Views => new TranslationProviderViews()
        {
            Config = UriUtility.ToAbsolute("/App_Plugins/TranslateProvider.Google/config.html")
        };

        public GoogleProvider(TranslationManagerContext context, ILogger logger)
            : base(context, logger)
        {
            LoadSettings();
            TranslationSettings.Saved += TranslationSettings_Saved;
        }

        private void TranslationSettings_Saved(TranslationSettingsEventArgs e)
        {
            LoadSettings();
        }

        private void LoadSettings()
        {
            _apiKey = TranslateConfigHelper.GetProviderSetting(this.Alias, "apiKey");
            _active = TranslateConfigHelper.IsProviderSetActive(this.Alias);
            _throttle = TranslateConfigHelper.GetProviderSetting(this.Alias, "throttle", 0);

        }

        ///////////////////

        public bool Active()
        {
            return _active && !_apiKey.IsNullOrWhiteSpace();
        }

        public async Task<TranslationAttempt<TranslationJob>> Cancel(TranslationJob job)
        {
            return await Task.FromResult(TranslationAttempt<TranslationJob>.Succeed(job));
        }

        public bool CanTranslate(TranslationJob job)
        {
            // we could cache this, so we don't keep calling the api
            // as this doesn't change that often?
            var languages = GetTargetLanguages(job.SourceCulture.Name);
            return languages.Any(x => x.InvariantEquals(job.TargetCulture.Name));
        }

        public async Task<TranslationAttempt<TranslationJob>> Check(TranslationJob job)
        {
            return await Task.FromResult(TranslationAttempt<TranslationJob>.Succeed(job));
        }

        public IEnumerable<string> GetTargetLanguages(string sourceLanguage)
        {
            var client = TranslationClient.CreateFromApiKey(_apiKey);
            return client.ListLanguages().Select(x => x.Code);
        }

        public void Reload()
        {
            LoadSettings();
        }

        public async Task<TranslationAttempt<TranslationJob>> Remove(TranslationJob job)
        {
            return await Task.FromResult(TranslationAttempt<TranslationJob>.Succeed(job));
        }

        public async Task<TranslationAttempt<TranslationJob>> Submit(TranslationJob job)
        {
            TranslationClient client = TranslationClient.CreateFromApiKey(_apiKey);

            _logger.Debug<GoogleProvider>("Translating from {0} to {1}",
                () => job.SourceCulture.TwoLetterISOLanguageName.Substring(0, 2),
                () => job.TargetCulture.TwoLetterISOLanguageName.Substring(0, 2));

            foreach (var node in job.Nodes)
            {
                foreach (var group in node.Groups)
                {
                    foreach (var property in group.Properties)
                    {
                        _logger.Debug<GoogleProvider>("-- Property: {0}", () => property.Alias);

                        var targetValues = new List<TranslationValue>();
                        var result = await GetTranslatedValue(client, property.Source, property.Target, job.SourceCulture, job.TargetCulture);
                        if (result == null)
                            return TranslationAttempt<TranslationJob>.Fail("No value translated");

                        property.Target = result;

                        if (_throttle > 0) await Task.Delay(_throttle);
                    }

                    if (_throttle > 0) await Task.Delay(_throttle);
                }

                if (_throttle > 0) await Task.Delay(_throttle);
            }

            job.Status = JobStatus.Received;
            return TranslationAttempt<TranslationJob>.Succeed(job);

        }

        private async Task<TranslationValue> GetTranslatedValue(TranslationClient client, TranslationValue sourceValue, TranslationValue targetValue, CultureInfoView sourceCulture, CultureInfoView targetCulture)
        {
            if (sourceValue.HasChildValues())
            {
                foreach (var innerValue in sourceValue.InnerValues)
                {
                    var innerTarget = targetValue.InnerValues[innerValue.Key];
                    if (innerTarget == null)
                        continue;

                    var translatedValue = await GetTranslatedValue(client, innerValue.Value, innerTarget, sourceCulture, targetCulture);
                    if (translatedValue != null)
                        innerTarget = translatedValue;
                }
            }

            if (!string.IsNullOrWhiteSpace(sourceValue.Value))
            {
                var sourceLangCode = GetSupportedLanguageCode(sourceCulture);
                var targetLangCode = GetSupportedLanguageCode(targetCulture);

                if (sourceValue.HtmlControl)
                {
                    var translation = await client.TranslateHtmlAsync(
                        sourceValue.Value, targetLangCode, sourceLangCode);

                    if (!string.IsNullOrWhiteSpace(translation.TranslatedText))
                    {
                        targetValue.Value = translation.TranslatedText;
                        targetValue.Translated = true;
                    }
                }
                else
                {
                    var translation = await client.TranslateTextAsync(
                        sourceValue.Value, targetLangCode, sourceLangCode);

                    if (!string.IsNullOrWhiteSpace(translation.TranslatedText))
                    {
                        targetValue.Value = translation.TranslatedText;
                        targetValue.Translated = true;
                    }

                }
            }

            return targetValue;
        }

        private string GetSupportedLanguageCode(CultureInfoView culture)
        {
            return culture.TwoLetterISOLanguageName.Substring(0, 2);
        }
    }
}
